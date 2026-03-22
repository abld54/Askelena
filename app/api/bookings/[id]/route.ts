import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendBookingCancellationEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

// GET /api/bookings/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: "asc" } },
          host: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      guest: { select: { id: true, name: true, email: true, image: true } },
      review: true,
    },
  });

  if (!booking) {
    return Response.json({ error: "Réservation non trouvée" }, { status: 404 });
  }

  // Only the guest or the host can view
  const isGuest = booking.guestId === session.user.id;
  const isHost = booking.listing.hostId === session.user.id;
  if (!isGuest && !isHost) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  return Response.json(booking);
}

// PATCH /api/bookings/[id] — cancel a booking
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { action } = body as { action?: string };

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, hostId: true, title: true } },
    },
  });

  if (!booking) {
    return Response.json({ error: "Réservation non trouvée" }, { status: 404 });
  }

  const isGuest = booking.guestId === session.user.id;
  const isHost = booking.listing.hostId === session.user.id;

  if (!isGuest && !isHost) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (action === "cancel") {
    if (!["pending", "confirmed"].includes(booking.status)) {
      return Response.json({ error: "Cette réservation ne peut pas être annulée" }, { status: 400 });
    }

    // Attempt Stripe refund if payment was completed
    if (booking.stripePaymentIntentId && booking.status === "confirmed") {
      try {
        await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
      } catch (err) {
        console.error("[cancel] Stripe refund failed:", err);
        // Continue with cancellation even if refund fails (handle manually)
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    // Send cancellation email
    await sendBookingCancellationEmail({
      to: booking.guestEmail,
      guestName: booking.guestName,
      listingTitle: booking.listing.title,
      bookingId: booking.id,
    }).catch(console.error);

    return Response.json(updated);
  }

  return Response.json({ error: "Action non reconnue" }, { status: 400 });
}
