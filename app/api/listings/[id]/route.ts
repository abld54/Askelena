import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/listings/[id] — full listing with images, host, reviews, average rating
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        host: { select: { id: true, name: true, image: true, bio: true, createdAt: true } },
        reviews: {
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!listing) {
      return Response.json({ error: "Annonce non trouvee" }, { status: 404 });
    }

    const avgRating =
      listing.reviews.length > 0
        ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
        : null;

    return Response.json({
      ...listing,
      avgRating,
      reviewCount: listing.reviews.length,
    });
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// PUT /api/listings/[id] — update listing (host only)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!listing) {
      return Response.json({ error: "Annonce non trouvee" }, { status: 404 });
    }

    if (listing.hostId !== session.user.id) {
      return Response.json({ error: "Acces refuse" }, { status: 403 });
    }

    let body: {
      title?: string;
      description?: string;
      type?: string;
      location?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      pricePerNight?: number;
      capacity?: number;
      amenities?: string[];
      isPublished?: boolean;
    };

    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Corps de requete invalide" }, { status: 400 });
    }

    // Validate type if provided
    if (body.type !== undefined) {
      const validTypes = ["peniche", "chateau", "villa", "treehouse", "other"];
      if (!validTypes.includes(body.type)) {
        return Response.json(
          { error: `type doit etre l'un de : ${validTypes.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Validate pricePerNight if provided
    if (body.pricePerNight !== undefined && body.pricePerNight <= 0) {
      return Response.json({ error: "pricePerNight doit etre positif" }, { status: 400 });
    }

    // Validate capacity if provided
    if (body.capacity !== undefined && body.capacity < 1) {
      return Response.json({ error: "capacity doit etre au moins 1" }, { status: 400 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.latitude !== undefined ? { latitude: body.latitude } : {}),
        ...(body.longitude !== undefined ? { longitude: body.longitude } : {}),
        ...(body.pricePerNight !== undefined ? { pricePerNight: body.pricePerNight } : {}),
        ...(body.capacity !== undefined ? { capacity: body.capacity } : {}),
        ...(body.amenities !== undefined ? { amenities: JSON.stringify(body.amenities) } : {}),
        ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
      },
      include: {
        images: { orderBy: { order: "asc" } },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("PUT /api/listings/[id] error:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// DELETE /api/listings/[id] — delete listing (host only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { hostId: true },
    });

    if (!listing) {
      return Response.json({ error: "Annonce non trouvee" }, { status: 404 });
    }

    if (listing.hostId !== session.user.id) {
      return Response.json({ error: "Acces refuse" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
