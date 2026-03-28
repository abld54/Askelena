import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: { images: { orderBy: { order: "asc" } }, host: { select: { id: true, name: true, image: true } } },
        },
        guest: { select: { id: true, name: true, email: true, image: true } },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only guest or host can view
    if (booking.guestId !== user.id && booking.listing.host.id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { listing: { select: { hostId: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Host or guest can update status
    if (booking.guestId !== user.id && booking.listing.hostId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (body.status) {
      data.status = body.status;
      if (body.status === "confirmed") data.confirmedAt = new Date();
      if (body.status === "cancelled") data.cancelledAt = new Date();
    }

    const updated = await prisma.booking.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/bookings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
