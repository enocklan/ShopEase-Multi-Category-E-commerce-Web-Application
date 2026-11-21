
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const SHOP_LATITUDE = -1.28339;
const SHOP_LONGITUDE = 36.82319;

export default {
  fetch: withSupabase(
    { auth: "user" },
    async (req, ctx) => {
      if (req.method !== "POST") {
        return Response.json(
          { success: false, error: "Method not allowed." },
          { status: 405 }
        );
      }

      try {
        const body = await req.json();
        const { items, shippingAddress } = body;

        // Validate the cart.
        if (!Array.isArray(items) || items.length === 0) {
          return Response.json(
            { success: false, error: "Your cart is empty." },
            { status: 400 }
          );
        }

        // Validate the shipping address.
        if (
          !shippingAddress ||
          typeof shippingAddress !== "object" ||
          Array.isArray(shippingAddress)
        ) {
          return Response.json(
            { success: false, error: "A valid shipping address is required." },
            { status: 400 }
          );
        }

        // Read the customer's selected delivery coordinates.
        const location = shippingAddress.delivery_location;

        const latitude = location?.latitude;
        const longitude = location?.longitude;

        if (
          typeof latitude !== "number" ||
          typeof longitude !== "number" ||
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          latitude < -90 ||
          latitude > 90 ||
          longitude < -180 ||
          longitude > 180
        ) {
          return Response.json(
            { success: false, error: "Please select a valid delivery location." },
            { status: 400 }
          );
        }

        // Calculate the driving distance on the server.
        const routeUrl =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${SHOP_LONGITUDE},${SHOP_LATITUDE};` +
          `${longitude},${latitude}?overview=false`;

        const routeResponse = await fetch(routeUrl, {
          signal: AbortSignal.timeout(10000),
        });

        if (!routeResponse.ok) {
          throw new Error("Unable to calculate the delivery route.");
        }

        const routeData = await routeResponse.json();

        if (
          routeData.code !== "Ok" ||
          !routeData.routes?.length ||
          !Number.isFinite(routeData.routes[0].distance)
        ) {
          throw new Error("No driving route was found for this location.");
        }

        // Keep the unrounded distance for accurate fee calculation.
        const distanceKm = routeData.routes[0].distance / 1000;

        if (!Number.isFinite(distanceKm) || distanceKm < 0) {
          throw new Error("Invalid delivery distance.");
        }

        // Save the server-calculated distance in the shipping address.
        const verifiedShippingAddress = {
          ...shippingAddress,
          road_distance_km: Number(distanceKm.toFixed(2)),
        };

        // Create the order using the authenticated customer's session.
        // The database function will calculate the delivery fee.
        const { data, error } = await ctx.supabase.rpc("create_order", {
          p_items: items,
          p_shipping_address: verifiedShippingAddress,
          p_road_distance_km: distanceKm,
        });

        if (error) {
          console.error("Order creation failed:", error.message);

          return Response.json(
            { success: false, error: error.message },
            { status: 400 }
          );
        }

        // Return the order details to the frontend.
        return Response.json({
          success: true,
          ...data,
          road_distance_km: Number(distanceKm.toFixed(2)),
        });
      } catch (error) {
        console.error("Create-order function error:", error);

        return Response.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to create your order.",
          },
          { status: 500 }
        );
      }
    }
  ),
};
