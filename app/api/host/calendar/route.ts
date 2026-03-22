import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

// GET /api/host/calendar?listingId=xxx
// Returns blocked dates and upcoming bookings for a listing owned by the authenticated host
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const listingId = searchParams.get("listingId");
  if (!listingId) {
    return Response.json({ error: "listingId est requis" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, hostId: true },
  });

  if (!listing || listing.hostId !== session.user.id) {
    return Response.json({ error: "Annonce non trouvée ou accès refusé" }, { status: 403 });
  }

  const [blockedDates, bookings] = await Promise.all([
    prisma.blockedDate.findMany({
      where: { listingId },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ["pending", "confirmed"] },
        endDate: { gte: new Date() },
      },
      include: {
        guest: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return Response.json({ blockedDates, bookings });
}

// POST /api/host/calendar — block or unblock dates
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  let body: { listingId: string; dates: string[]; action: "block" | "unblock" };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { listingId, dates, action } = body;

  if (!listingId || !Array.isArray(dates) || !["block", "unblock"].includes(action)) {
    return Response.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, hostId: true },
  });

  if (!listing || listing.hostId !== session.user.id) {
    return Response.json({ error: "Annonce non trouvée ou accès refusé" }, { status: 403 });
  }

  const parsedDates = dates
    .map((d) => startOfDay(new Date(d)))
    .filter((d) => !isNaN(d.getTime()));

  if (parsedDates.length === 0) {
    return Response.json({ error: "Aucune date valide fournie" }, { status: 400 });
  }

  if (action === "block") {
    // upsert — ignore conflicts
    await prisma.$transaction(
      parsedDates.map((date) =>
        prisma.blockedDate.upsert({
          where: { listingId_date: { listingId, date } },
          create: { listingId, date },
          update: {},
        })
      )
    );
  } else {
    await prisma.blockedDate.deleteMany({
      where: {
        listingId,
        date: { in: parsedDates },
      },
    });
  }

  return Response.json({ ok: true, affected: parsedDates.length });
}
