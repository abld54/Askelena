import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    let stripe;
    try {
      stripe = (await import("@/lib/stripe")).stripe;
    } catch {
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { id: string; metadata?: { bookingId?: string }; payment_intent?: string };
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "confirmed",
            confirmedAt: new Date(),
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
          },
        });
      }
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as { metadata?: { bookingId?: string } };
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "cancelled", cancelledAt: new Date() },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("POST /api/stripe/webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
