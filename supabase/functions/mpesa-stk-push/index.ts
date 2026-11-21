
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke";

const CALLBACK_URL =
  "https://cqyemccekhxhorcevjbs.supabase.co/functions/v1/mpesa-callback";

// Convert Kenyan phone numbers to 254XXXXXXXXX format.
function formatPhoneNumber(phone: string): string | null {
  let cleaned = phone.replace(/[\s\-+()]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.slice(1);
  }

  if (!/^254[17]\d{8}$/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

// Generate the Daraja timestamp in YYYYMMDDHHMMSS format.
function getTimestamp(): string {
  return new Date().toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
}

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 },
        );
      }

      try {
        const userId = ctx.userClaims?.id;

        if (!userId) {
          return Response.json(
            { error: "You must be logged in to make a payment." },
            { status: 401 },
          );
        }

        const body = await req.json();
        const { orderId, phoneNumber } = body;

        if (
          typeof orderId !== "string" ||
          typeof phoneNumber !== "string"
        ) {
          return Response.json(
            { error: "Order ID and phone number are required." },
            { status: 400 },
          );
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);

        if (!formattedPhone) {
          return Response.json(
            { error: "Enter a valid Kenyan phone number." },
            { status: 400 },
          );
        }

        // Read the order using the authenticated customer's RLS context.
        const { data: order, error: orderError } = await ctx.supabase
          .from("orders")
          .select("id, user_id, order_number, total_amount, currency, status")
          .eq("id", orderId)
          .eq("user_id", userId)
          .maybeSingle();

        if (orderError) {
          throw orderError;
        }

        if (!order) {
          return Response.json(
            { error: "Order not found or you do not have access to it." },
            { status: 404 },
          );
        }

        if (order.status !== "pending") {
          return Response.json(
            { error: "This order is not awaiting payment." },
            { status: 400 },
          );
        }

        if (order.currency !== "KES") {
          return Response.json(
            { error: "M-Pesa payments are only supported in KES." },
            { status: 400 },
          );
        }

        const amount = Number(order.total_amount);

        if (!Number.isSafeInteger(amount) || amount <= 0) {
          return Response.json(
            { error: "The order amount must be a positive whole number in KES." },
            { status: 400 },
          );
        }

        const supabaseAdmin = ctx.supabaseAdmin;

        // Prevent another STK request while an earlier attempt is pending.
        const { data: existingPayment, error: existingError } =
          await supabaseAdmin
            .from("payments")
            .select("id")
            .eq("order_id", order.id)
            .eq("user_id", userId)
            .eq("status", "pending")
            .limit(1)
            .maybeSingle();

        if (existingError) {
          throw existingError;
        }

        if (existingPayment) {
          return Response.json(
            {
              error: "A payment attempt is already pending for this order.",
            },
            { status: 409 },
          );
        }

        // Read Daraja credentials from Supabase Edge Function secrets.
        const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
        const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
        const shortcode = Deno.env.get("MPESA_SHORTCODE");
        const passkey = Deno.env.get("MPESA_PASSKEY");

        if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
          throw new Error("Daraja credentials are not configured.");
        }

        // Request an OAuth access token from Safaricom.
        const oauthResponse = await fetch(
          `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
            },
          },
        );

        const oauthData = await oauthResponse.json();

        if (!oauthResponse.ok || !oauthData.access_token) {
          console.error("Daraja OAuth request failed:", oauthData);

          return Response.json(
            { error: "Could not connect to M-Pesa. Please try again." },
            { status: 502 },
          );
        }

        const timestamp = getTimestamp();
        const password = btoa(`${shortcode}${passkey}${timestamp}`);

        // Create the pending payment record before initiating STK Push.
        const { data: payment, error: paymentError } =
          await supabaseAdmin
            .from("payments")
            .insert({
              order_id: order.id,
              user_id: userId,
              amount,
              currency: "KES",
              payment_method: "mpesa",
              status: "pending",
              phone_number: formattedPhone,
            })
            .select("id")
            .single();

        if (paymentError) {
          throw paymentError;
        }

        // Initiate the M-Pesa STK Push request.
        const stkResponse = await fetch(
          `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
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
              TransactionType: "CustomerPayBillOnline",
              Amount: amount,
              PartyA: formattedPhone,
              PartyB: shortcode,
              PhoneNumber: formattedPhone,
              CallBackURL: CALLBACK_URL,
              AccountReference: String(order.order_number).slice(0, 12),
              TransactionDesc: "ShopEase order",
            }),
          },
        );

        const stkData = await stkResponse.json();

        if (
          !stkResponse.ok ||
          String(stkData.ResponseCode) !== "0" ||
          !stkData.CheckoutRequestID
        ) {
          console.error("Daraja STK Push failed:", stkData);

          await supabaseAdmin
            .from("payments")
            .update({ status: "failed" })
            .eq("id", payment.id)
            .eq("status", "pending");

          return Response.json(
            {
              error: stkData.errorMessage ||
                stkData.ResponseDescription ||
                "M-Pesa could not initiate the payment.",
            },
            { status: 502 },
          );
        }

        // Save the identifiers needed to match the Safaricom callback.
        const { error: updateError } = await supabaseAdmin
          .from("payments")
          .update({
            checkout_request_id: stkData.CheckoutRequestID,
            merchant_request_id: stkData.MerchantRequestID,
          })
          .eq("id", payment.id);

        if (updateError) {
          console.error(
            "Could not save Daraja request IDs:",
            updateError,
          );

          throw new Error(
            "STK Push was initiated, but payment tracking could not be saved.",
          );
        }

        return Response.json({
          success: true,
          message: stkData.CustomerMessage ||
            "M-Pesa payment request sent to your phone.",
          checkoutRequestId: stkData.CheckoutRequestID,
          paymentId: payment.id,
        });
      } catch (error) {
        console.error("STK Push error:", error);

        return Response.json(
          { error: "Unable to initiate M-Pesa payment." },
          { status: 500 },
        );
      }
    },
  ),
};
