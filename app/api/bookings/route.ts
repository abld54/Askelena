import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    const where: Record<string, unknown> = {};

    if (user.role === "host" && listingId) {
      // Host viewing bookings for their listing
      where.listingId = listingId;
      where.listing = { hostId: user.id };
    } else {
      // Guest viewing own bookings
      where.guestId = user.id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: { id: true, title: true, location: true, images: { take: 1 } },
        },
        guest: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string };

    const body = await request.json();
    const { listingId, startDate, endDate, specialRequests } = body;

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "listingId, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    const totalPrice = nights * listing.pricePerNight;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true, email: true },
    });

    const booking = await prisma.booking.create({
      data: {
        listingId,
        guestId: user.id,
        startDate: start,
        endDate: end,
        nights,
        totalPrice,
        status: "pending",
        guestEmail: dbUser?.email ?? "",
        guestName: dbUser?.name ?? "",
        specialRequests: specialRequests ?? null,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
