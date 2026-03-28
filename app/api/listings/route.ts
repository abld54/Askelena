import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const capacity = searchParams.get("capacity");

    const where: Record<string, unknown> = { isPublished: true };
    if (type) where.type = type;
    if (location) where.location = { contains: location };
    if (capacity) where.capacity = { gte: parseInt(capacity) };
    if (minPrice || maxPrice) {
      where.pricePerNight = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" } },
        host: { select: { id: true, name: true, image: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    if (user.role !== "host") {
      return NextResponse.json({ error: "Forbidden: host role required" }, { status: 403 });
    }

    const body = await request.json();
    const listing = await prisma.listing.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        location: body.location,
        address: body.address ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        pricePerNight: body.pricePerNight,
        capacity: body.capacity,
        hostId: user.id,
        amenities: body.amenities ? JSON.stringify(body.amenities) : "[]",
        isPublished: body.isPublished ?? false,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
