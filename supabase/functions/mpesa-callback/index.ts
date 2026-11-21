
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke";

type MpesaMetadataItem = {
  Name: string;
  Value?: string | number;
};

function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
}

function getMetadataValue(
  items: MpesaMetadataItem[],
  name: string,
): string | number | undefined {
  return items.find((item) => item.Name === name)?.Value;
}

export default {
  fetch: withSupabase(
    { auth: "none" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { error: "Method not allowed" },
          { status: 405 },
        );
      }

      try {
        const body = await req.json();
        const callback = body?.Body?.stkCallback;

        if (
          !callback?.CheckoutRequestID ||
          !callback?.MerchantRequestID ||
          callback.ResultCode === undefined
        ) {
          return Response.json(
            { error: "Invalid callback data" },
            { status: 400 },
          );
        }

        const checkoutId = callback.CheckoutRequestID;
        const callbackResultCode = Number(callback.ResultCode);

        // Find the payment.
        const { data: payment, error: paymentLookupError } =
          await ctx.supabaseAdmin
            .from("payments")
            .select(
              "id, order_id, amount, currency, status, phone_number, merchant_request_id",
            )
            .eq("checkout_request_id", checkoutId)
            .maybeSingle();

        if (paymentLookupError) {
          throw paymentLookupError;
        }

        if (!payment) {
          console.error("Unknown checkout request:", checkoutId);

          return Response.json({
            ResultCode: 0,
            ResultDesc: "Accepted",
          });
        }

        // Avoid processing duplicate callbacks.
        if (
          payment.status === "completed" ||
          payment.status === "failed"
        ) {
          return Response.json({
            ResultCode: 0,
            ResultDesc: "Already processed",
          });
        }

        // Verify merchant request ID.
        if (
          payment.merchant_request_id &&
          payment.merchant_request_id !== callback.MerchantRequestID
        ) {
          console.error("Merchant request ID mismatch:", checkoutId);

          return Response.json({
            ResultCode: 0,
            ResultDesc: "Verification failed",
          });
        }

        // Verify the related order.
        const { data: order, error: orderError } =
          await ctx.supabaseAdmin
            .from("orders")
            .select("id, total_amount, currency, status")
            .eq("id", payment.order_id)
            .maybeSingle();

        if (orderError) {
          throw orderError;
        }

        if (
          !order ||
          order.currency !== "KES" ||
          Number(order.total_amount) !== Number(payment.amount)
        ) {
          console.error("Order/payment mismatch:", checkoutId);

          return Response.json({
            ResultCode: 0,
            ResultDesc: "Order verification failed",
          });
        }

        // Handle unsuccessful payments directly.
        // Do not compare a failed callback with an STK Query response.
        if (callbackResultCode !== 0) {
          console.log(
            "M-Pesa payment unsuccessful:",
            checkoutId,
            callbackResultCode,
            callback.ResultDesc,
          );

          const { error: failedPaymentError } =
            await ctx.supabaseAdmin
              .from("payments")
              .update({ status: "failed" })
              .eq("id", payment.id)
              .eq("status", "pending");

          if (failedPaymentError) {
            throw failedPaymentError;
          }

          return Response.json({
            ResultCode: 0,
            ResultDesc: "Failed payment recorded",
          });
        }

        // A successful callback must contain payment metadata.
        const items: MpesaMetadataItem[] =
          callback.CallbackMetadata?.Item ?? [];

        const receipt = getMetadataValue(
          items,
          "MpesaReceiptNumber",
        );

        const paidAmount = Number(
          getMetadataValue(items, "Amount"),
        );

        const callbackPhone = getMetadataValue(
          items,
          "PhoneNumber",
        );

        if (
          !receipt ||
          !Number.isFinite(paidAmount) ||
          paidAmount !== Number(payment.amount)
        ) {
          throw new Error(
            "Payment amount or receipt verification failed.",
          );
        }

        if (
          callbackPhone !== undefined &&
          String(callbackPhone) !== payment.phone_number
        ) {
          throw new Error("Payment phone number mismatch.");
        }

        // Read Daraja credentials.
        const consumerKey = Deno.env.get("DARAJA_CONSUMER_KEY");
        const consumerSecret = Deno.env.get("DARAJA_CONSUMER_SECRET");
        const shortcode = Deno.env.get("MPESA_SHORTCODE");
        const passkey = Deno.env.get("MPESA_PASSKEY");

        if (
          !consumerKey ||
          !consumerSecret ||
          !shortcode ||
          !passkey
        ) {
          throw new Error("Daraja credentials are not configured.");
        }

        // Generate Daraja access token.
        const oauthResponse = await fetch(
          `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
          {
            headers: {
              Authorization: `Basic ${btoa(
                `${consumerKey}:${consumerSecret}`,
              )}`,
            },
          },
        );

        const oauthData = await oauthResponse.json();

        if (!oauthResponse.ok || !oauthData.access_token) {
          throw new Error("Could not authenticate with Daraja.");
        }

        // Verify the successful transaction using STK Query.
        const timestamp = getTimestamp();
        const password = btoa(
          `${shortcode}${passkey}${timestamp}`,
        );

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
              CheckoutRequestID: checkoutId,
            }),
          },
        );

        const queryData = await queryResponse.json();

        if (!queryResponse.ok) {
          console.error("STK Query request failed:", queryData);

          throw new Error(
            "Safaricom transaction verification failed.",
          );
        }

        const queryResultCode = Number(queryData.ResultCode);

        // Never mark the payment completed if query verification
        // does not independently confirm success.
        if (queryResultCode !== 0) {
          console.warn(
            "Payment verification is not yet successful:",
            checkoutId,
            queryResultCode,
            queryData.ResultDesc,
          );

          return Response.json({
            ResultCode: 0,
            ResultDesc: "Payment verification pending",
          });
        }

        // Mark payment completed only after verification.
        const { data: updatedPayment, error: updatePaymentError } =
          await ctx.supabaseAdmin
            .from("payments")
            .update({
              status: "completed",
              mpesa_receipt_number: String(receipt),
              transaction_reference: String(receipt),
            })
            .eq("id", payment.id)
            .eq("status", "pending")
            .select("id")
            .maybeSingle();

        if (updatePaymentError) {
          throw updatePaymentError;
        }

        // Update the order after successful payment.
        if (updatedPayment) {
          const { error: updateOrderError } =
            await ctx.supabaseAdmin
              .from("orders")
              .update({ status: "processing" })
              .eq("id", payment.order_id)
              .eq("status", "pending");

          if (updateOrderError) {
            throw updateOrderError;
          }
        }

        console.log(
          "M-Pesa payment successfully verified:",
          checkoutId,
          receipt,
        );

        return Response.json({
          ResultCode: 0,
          ResultDesc: "Payment successfully verified",
        });
      } catch (error) {
        console.error("M-Pesa callback error:", error);

        return Response.json(
          { error: "Callback processing failed" },
          { status: 500 },
        );
      }
    },
  ),
};
