import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/listings — list published listings (public)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const capacity = searchParams.get("capacity");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    // Build price filter — merge minPrice and maxPrice into one object
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.lte = parseFloat(maxPrice);

    // Build the AND conditions array for complex filtering
    const andConditions: Record<string, unknown>[] = [];

    if (type) andConditions.push({ type });
    if (city) andConditions.push({ location: { contains: city } });
    else if (location) andConditions.push({ location: { contains: location } });
    if (Object.keys(priceFilter).length > 0) andConditions.push({ pricePerNight: priceFilter });
    if (capacity) andConditions.push({ capacity: { gte: parseInt(capacity, 10) } });

    // Text search across title, description, location
    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { location: { contains: search } },
        ],
      });
    }

    const where = {
      isPublished: true,
      ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          host: { select: { id: true, name: true, image: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    const listingsWithRating = listings.map((l) => ({
      ...l,
      avgRating:
        l.reviews.length > 0
          ? l.reviews.reduce((sum, r) => sum + r.rating, 0) / l.reviews.length
          : null,
      reviewCount: l.reviews.length,
      reviews: undefined,
    }));

    return Response.json({
      data: listingsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return Response.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/listings — create a new listing (host only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non authentifie" }, { status: 401 });
    }

    // Check role — allow "host" or auto-promote on first listing creation
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "host") {
      // Auto-promote to host on first listing creation
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "host" },
      });
    }

    let body: {
      title: string;
      description: string;
      type: string;
      location: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      pricePerNight: number;
      capacity: number;
      amenities?: string[];
      isPublished?: boolean;
      images?: { url: string; alt?: string }[];
    };

    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Corps de requete invalide" }, { status: 400 });
    }

    const { title, description, type, location, address, latitude, longitude, pricePerNight, capacity, amenities, isPublished, images } = body;

    if (!title || !description || !type || !location || !pricePerNight || !capacity) {
      return Response.json(
        { error: "title, description, type, location, pricePerNight, capacity sont requis" },
        { status: 400 }
      );
    }

    const validTypes = ["peniche", "chateau", "villa", "treehouse", "other"];
    if (!validTypes.includes(type)) {
      return Response.json(
        { error: `type doit etre l'un de : ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    if (pricePerNight <= 0) {
      return Response.json({ error: "pricePerNight doit etre positif" }, { status: 400 });
    }

    if (capacity < 1) {
      return Response.json({ error: "capacity doit etre au moins 1" }, { status: 400 });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        type,
        location,
        address: address ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        pricePerNight,
        capacity,
        hostId: session.user.id,
        amenities: JSON.stringify(amenities ?? []),
        isPublished: isPublished ?? false,
        images: images?.length
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                alt: img.alt ?? title,
                order: i,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { order: "asc" } },
      },
    });

    return Response.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return Response.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
