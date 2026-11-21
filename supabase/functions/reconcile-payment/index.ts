
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke";

function getNairobiTimestamp(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const values: Record<string, string> = {};

  for (const part of parts) {
    values[part.type] = part.value;
  }

  return (
    values.year +
    values.month +
    values.day +
    values.hour +
    values.minute +
    values.second
  );
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed." },
        { status: 405 },
      );
    }

    try {
      // 1. Confirm the administrator is authenticated.
      const userId = ctx.userClaims?.id;

      if (!userId) {
        return Response.json(
          { error: "Authentication is required." },
          { status: 401 },
        );
      }

      // 2. Verify the user's administrator role on the server.
      const { data: profile, error: profileError } = await ctx.supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Admin profile lookup failed:", profileError);
        return Response.json(
          { error: "Could not verify administrator access." },
          { status: 500 },
        );
      }

      if (profile?.role !== "admin") {
        return Response.json(
          { error: "Administrator access is required." },
          { status: 403 },
        );
      }

      // 3. Read the payment ID supplied by the admin.
      const body = await req.json();
      const paymentId = body.paymentId;

      if (typeof paymentId !== "string" || !paymentId.trim()) {
        return Response.json(
          { error: "A valid payment ID is required." },
          { status: 400 },
        );
      }

      const supabaseAdmin = ctx.supabaseAdmin;

      // 4. Retrieve the payment directly from the database.
      const { data: payment, error: paymentError } =
        await supabaseAdmin
          .from("payments")
          .select(
            "id, order_id, amount, currency, payment_method, status, checkout_request_id",
          )
          .eq("id", paymentId)
          .maybeSingle();

      if (paymentError) throw paymentError;

      if (!payment) {
        return Response.json(
          { error: "Payment record not found." },
          { status: 404 },
        );
      }

      if (payment.payment_method !== "mpesa" || payment.currency !== "KES") {
        return Response.json(
          { error: "This function only reconciles KES M-Pesa payments." },
          { status: 400 },
        );
      }

      // 5. Retrieve and validate the associated order.
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .select("id, total_amount, currency, status")
        .eq("id", payment.order_id)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!order) {
        return Response.json(
          { error: "The associated order could not be found." },
          { status: 404 },
        );
      }

      if (
        order.currency !== "KES" ||
        Number(order.total_amount) !== Number(payment.amount)
      ) {
        return Response.json(
          { error: "Payment amount does not match the order amount." },
          { status: 409 },
        );
      }

      // 6. Make retries safe if payment was already completed.
      if (payment.status === "completed") {
        if (order.status === "pending") {
          const { error: orderUpdateError } = await supabaseAdmin
            .from("orders")
            .update({ status: "processing" })
            .eq("id", order.id)
            .eq("status", "pending");

          if (orderUpdateError) throw orderUpdateError;
        }

        return Response.json({
          success: true,
          message: "This payment was already completed.",
        });
      }

      if (payment.status !== "pending") {
        return Response.json(
          {
            error: `This payment cannot be reconciled because its status is ${payment.status}.`,
          },
          { status: 409 },
        );
      }

      if (order.status !== "pending") {
        return Response.json(
          { error: "The associated order is not awaiting payment." },
          { status: 409 },
        );
      }

      if (!payment.checkout_request_id) {
        return Response.json(
          { error: "The payment has no Safaricom checkout request ID." },
          { status: 409 },
        );
      }

      // 7. Load Daraja credentials from Supabase secrets.
      const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
      const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
      const shortcode = Deno.env.get("MPESA_SHORTCODE");
      const passkey = Deno.env.get("MPESA_PASSKEY");

      if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
        throw new Error("Daraja credentials are not configured.");
      }

      // 8. Request a Daraja access token.
      const oauthResponse = await fetch(
        `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${btoa(
              `${consumerKey}:${consumerSecret}`,
            )}`,
          },
        },
      );

      const oauthData = await oauthResponse.json();

      if (!oauthResponse.ok || !oauthData.access_token) {
        console.error("Daraja OAuth request failed:", oauthData);

        return Response.json(
          {
            error: "Safaricom authentication is temporarily unavailable. Try again later.",
          },
          { status: 503 },
        );
      }

      // 9. Query Safaricom using the stored checkout request ID.
      const timestamp = getNairobiTimestamp();
      const password = btoa(`${shortcode}${passkey}${timestamp}`);

      const queryResponse = await fetch(
        `${DARAJA_BASE_URL}/mpesa/stkpushquery/v1/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${oauthData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: payment.checkout_request_id,
          }),
        },
      );

      const queryData = await queryResponse.json();

      if (!queryResponse.ok) {
        console.error("Daraja STK Query failed:", queryData);

        // Do not mark the payment failed because a query error
        // does not prove that the customer did not pay.
        return Response.json(
          {
            success: false,
            pending: true,
            message: "Safaricom could not verify this payment right now. Leave it pending and try again later.",
          },
          { status: 503 },
        );
      }

      // Only ResultCode 0 is accepted as confirmation of success.
      if (String(queryData.ResultCode) !== "0") {
        console.log("Daraja has not confirmed payment success:", queryData);

        return Response.json(
          {
            success: false,
            pending: true,
            message: queryData.ResultDesc ||
              "Safaricom has not confirmed successful payment. The payment remains pending.",
          },
          { status: 202 },
        );
      }

      // 10. Mark the payment completed only after Daraja confirms success.
      const { data: updatedPayment, error: updatePaymentError } =
        await supabaseAdmin
          .from("payments")
          .update({ status: "completed" })
          .eq("id", payment.id)
          .eq("status", "pending")
          .select("id")
          .maybeSingle();

      if (updatePaymentError) throw updatePaymentError;

      if (!updatedPayment) {
        return Response.json(
          {
            error: "The payment changed while reconciliation was running. Check its current status before retrying.",
          },
          { status: 409 },
        );
      }

      // 11. Move the associated order into processing.
      const { error: updateOrderError } = await supabaseAdmin
        .from("orders")
        .update({ status: "processing" })
        .eq("id", order.id)
        .eq("status", "pending");

      if (updateOrderError) {
        console.error(
          "Payment completed, but order update failed:",
          updateOrderError,
        );

        return Response.json(
          {
            success: true,
            message: "Safaricom confirmed the payment. The order status still needs updating; retry reconciliation.",
          },
          { status: 500 },
        );
      }

      return Response.json({
        success: true,
        message: "Safaricom confirmed the payment. Payment completed and order moved to processing.",
      });
    } catch (error) {
      console.error("Payment reconciliation error:", error);

      return Response.json(
        { error: "Unable to reconcile this payment right now." },
        { status: 500 },
      );
    }
  }),
};
