import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const listings = await prisma.listing.findMany({
    where: { hostId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      location: true,
      pricePerNight: true,
      isPublished: true,
    },
  });

  return NextResponse.json(listings);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const listing = await prisma.listing.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        location: body.location,
        address: body.address || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        pricePerNight: body.pricePerNight || 0,
        capacity: body.capacity || 1,
        amenities: body.amenities || "[]",
        isPublished: body.isPublished || false,
        hostId: session.user.id,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error("Create listing error:", err);
    return NextResponse.json({ error: "Erreur lors de la creation" }, { status: 500 });
  }
}
