import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isRangeAvailable, calculateNights, calculateTotalPrice } from "@/lib/booking";
import { startOfDay } from "date-fns";

// POST /api/bookings — initiate a booking + Stripe Checkout session
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: {
    listingId: string;
    startDate: string;
    endDate: string;
    specialRequests?: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { listingId, startDate: startStr, endDate: endStr, specialRequests } = body;

  if (!listingId || !startStr || !endStr) {
    return Response.json({ error: "listingId, startDate, endDate sont requis" }, { status: 400 });
  }

  const startDate = startOfDay(new Date(startStr));
  const endDate = startOfDay(new Date(endStr));

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return Response.json({ error: "Dates invalides" }, { status: 400 });
  }

  const nights = calculateNights(startDate, endDate);
  if (nights < 1) {
    return Response.json({ error: "La durée minimum est 1 nuit" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (!listing || !listing.isPublished) {
    return Response.json({ error: "Annonce non trouvée" }, { status: 404 });
  }

  // Prevent host from booking their own listing
  if (listing.hostId === session.user.id) {
    return Response.json({ error: "Vous ne pouvez pas réserver votre propre annonce" }, { status: 400 });
  }

  const available = await isRangeAvailable(listingId, startDate, endDate);
  if (!available) {
    return Response.json({ error: "Ces dates ne sont plus disponibles" }, { status: 409 });
  }

  const { subtotal, serviceFee, total } = calculateTotalPrice(listing.pricePerNight, nights);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Create a pending booking first (we need the ID for Stripe metadata)
  const booking = await prisma.booking.create({
    data: {
      listingId,
      guestId: session.user.id,
      startDate,
      endDate,
      nights,
      totalPrice: total,
      status: "pending",
      guestEmail: session.user.email!,
      guestName: session.user.name ?? session.user.email!,
      specialRequests: specialRequests ?? null,
    },
  });

  // Create Stripe Checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: listing.title,
            description: `${nights} nuit${nights > 1 ? "s" : ""} · ${listing.location}`,
            images: listing.images[0] ? [listing.images[0].url] : [],
          },
          unit_amount: Math.round(subtotal * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Frais de service",
          },
          unit_amount: Math.round(serviceFee * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      listingId,
      guestId: session.user.id,
    },
    customer_email: session.user.email!,
    success_url: `${appUrl}/bookings/${booking.id}?payment=success`,
    cancel_url: `${appUrl}/listings/${listingId}/book?cancelled=true`,
  });

  // Update booking with Stripe session ID
  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return Response.json({
    bookingId: booking.id,
    checkoutUrl: checkoutSession.url,
  });
}

// GET /api/bookings — list current user's bookings
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const role = searchParams.get("role"); // "guest" | "host"
  const status = searchParams.get("status");

  if (role === "host") {
    // Return bookings for host's listings
    const bookings = await prisma.booking.findMany({
      where: {
        listing: { hostId: session.user.id },
        ...(status ? { status } : {}),
      },
      include: {
        listing: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
        guest: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(bookings);
  }

  // Default: guest bookings
  const bookings = await prisma.booking.findMany({
    where: {
      guestId: session.user.id,
      ...(status ? { status } : {}),
    },
    include: {
      listing: { include: { images: { orderBy: { order: "asc" }, take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(bookings);
}
