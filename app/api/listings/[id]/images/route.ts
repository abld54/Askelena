import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// GET /api/listings/[id]/images
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const images = await prisma.image.findMany({
    where: { listingId: id },
    orderBy: { order: "asc" },
  });

  return Response.json(images);
}

// POST /api/listings/[id]/images — add image URL (host only)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { hostId: true },
  });

  if (!listing) {
    return Response.json({ error: "Annonce non trouvée" }, { status: 404 });
  }

  if (listing.hostId !== session.user.id) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  let body: { url: string; alt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  if (!body.url) {
    return Response.json({ error: "url est requis" }, { status: 400 });
  }

  // Determine next order index
  const lastImage = await prisma.image.findFirst({
    where: { listingId: id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const image = await prisma.image.create({
    data: {
      url: body.url,
      alt: body.alt ?? "",
      order: (lastImage?.order ?? -1) + 1,
      listingId: id,
    },
  });

  return Response.json(image, { status: 201 });
}
