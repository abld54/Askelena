import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { listing: { hostId: session.user.id } },
    orderBy: { createdAt: "desc" },
    include: { listing: { select: { title: true } } },
  });

  return NextResponse.json(
    bookings.map((b) => ({
      id: b.id,
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      listingTitle: b.listing.title,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      nights: b.nights,
      totalPrice: b.totalPrice,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }))
  );
}
