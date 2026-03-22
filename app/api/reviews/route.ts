import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reviews — create a review (auth required, must have completed booking)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: {
    bookingId: string;
    rating: number;
    comment: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { bookingId, rating, comment } = body;

  if (!bookingId || rating == null || !comment) {
    return Response.json(
      { error: "bookingId, rating et comment sont requis" },
      { status: 400 }
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json(
      { error: "La note doit être un entier entre 1 et 5" },
      { status: 400 }
    );
  }

  // Find the booking and verify ownership + status
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking) {
    return Response.json({ error: "Réservation non trouvée" }, { status: 404 });
  }

  if (booking.guestId !== session.user.id) {
    return Response.json(
      { error: "Cette réservation ne vous appartient pas" },
      { status: 403 }
    );
  }

  if (booking.status !== "completed") {
    return Response.json(
      { error: "Vous ne pouvez laisser un avis que pour un séjour terminé" },
      { status: 400 }
    );
  }

  if (booking.review) {
    return Response.json(
      { error: "Un avis existe déjà pour cette réservation" },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      listingId: booking.listingId,
      bookingId: booking.id,
      authorId: session.user.id,
      rating,
      comment,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  return Response.json(review, { status: 201 });
}

// GET /api/reviews?listingId=xxx — get reviews for a listing (public)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return Response.json(
      { error: "Le paramètre listingId est requis" },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: { listingId },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(reviews);
}
