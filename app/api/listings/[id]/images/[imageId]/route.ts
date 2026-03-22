import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; imageId: string }> };

// DELETE /api/listings/[id]/images/[imageId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id, imageId } = await params;

  const image = await prisma.image.findUnique({
    where: { id: imageId },
    include: { listing: { select: { hostId: true } } },
  });

  if (!image || image.listingId !== id) {
    return Response.json({ error: "Image non trouvée" }, { status: 404 });
  }

  if (image.listing.hostId !== session.user.id) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.image.delete({ where: { id: imageId } });

  return Response.json({ success: true });
}
