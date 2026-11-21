
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type MpesaMetadataItem = {
  Name: string;
  Value?: string | number;
};

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

        // Find the payment using its checkout request ID.
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

        // Ignore duplicate callbacks for completed or failed payments.
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
          payment.currency !== "KES" ||
          Number(order.total_amount) !== Number(payment.amount)
        ) {
          console.error("Order/payment mismatch:", checkoutId);

          return Response.json({
            ResultCode: 0,
            ResultDesc: "Order verification failed",
          });
        }

        // Handle unsuccessful M-Pesa transactions.
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

        // Extract successful transaction metadata.
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

        // Validate receipt and payment amount.
        if (
          typeof receipt !== "string" ||
          !receipt.trim() ||
          !Number.isFinite(paidAmount) ||
          paidAmount !== Number(payment.amount)
        ) {
          throw new Error(
            "Payment amount or receipt verification failed.",
          );
        }

        // Validate the payment phone number when supplied.
        if (
          callbackPhone !== undefined &&
          String(callbackPhone) !== payment.phone_number
        ) {
          throw new Error("Payment phone number mismatch.");
        }

        // Successful Daraja callback metadata has been validated.
        // No additional STK Query request is needed here.
        console.log(
          "Valid M-Pesa success callback received:",
          checkoutId,
          receipt,
          paidAmount,
        );

        // Record the successful payment.
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
          "M-Pesa payment successfully recorded:",
          checkoutId,
          receipt,
        );

        return Response.json({
          ResultCode: 0,
          ResultDesc: "Payment successfully recorded",
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
