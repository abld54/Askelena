import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmationEmail } from "@/lib/email";
import Stripe from "stripe";

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
        console.error("[webhook] Missing bookingId in session metadata");
        break;
      }

      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "confirmed",
          confirmedAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string | null,
        },
        include: {
          listing: { select: { title: true } },
        },
      });

      // Send confirmation email
      await sendBookingConfirmationEmail({
        to: booking.guestEmail,
        guestName: booking.guestName,
        listingTitle: booking.listing.title,
        startDate: booking.startDate,
        endDate: booking.endDate,
        nights: booking.nights,
        totalPrice: booking.totalPrice,
        bookingId: booking.id,
      }).catch(console.error);

      break;
    }

    case "checkout.session.expired": {
      // Payment abandoned — cancel the pending booking
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await prisma.booking.updateMany({
          where: { id: bookingId, status: "pending" },
          data: { status: "cancelled", cancelledAt: new Date() },
        });
      }
      break;
    }

    case "charge.refunded": {
      // Update booking status when a refund is issued outside our cancel flow
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        await prisma.booking.updateMany({
          where: {
            stripePaymentIntentId: charge.payment_intent as string,
            status: { not: "cancelled" },
          },
          data: { status: "cancelled", cancelledAt: new Date() },
        });
      }
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return Response.json({ received: true });
}
