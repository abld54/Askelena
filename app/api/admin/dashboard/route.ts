import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const hostId = session.user.id;

  const [totalListings, totalBookings, pendingBookings, revenueResult, recentBookingsRaw] = await Promise.all([
    prisma.listing.count({ where: { hostId } }),
    prisma.booking.count({
      where: { listing: { hostId } },
    }),
    prisma.booking.count({
      where: { listing: { hostId }, status: "pending" },
    }),
    prisma.booking.aggregate({
      where: { listing: { hostId }, status: { in: ["confirmed", "completed"] } },
      _sum: { totalPrice: true },
    }),
    prisma.booking.findMany({
      where: { listing: { hostId } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { listing: { select: { title: true } } },
    }),
  ]);

  const recentBookings = recentBookingsRaw.map((b) => ({
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
  }));

  return NextResponse.json({
    stats: {
      totalListings,
      totalBookings,
      pendingBookings,
      revenue: revenueResult._sum.totalPrice || 0,
    },
    recentBookings,
  });
}
