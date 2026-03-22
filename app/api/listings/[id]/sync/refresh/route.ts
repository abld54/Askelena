import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { syncCalendar } from "@/lib/sync-calendar";

type Params = { params: Promise<{ id: string }> };

// POST /api/listings/[id]/sync/refresh — Force refresh all syncs for a listing
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, hostId: true },
    });

    if (!listing || listing.hostId !== session.user.id) {
      return Response.json({ error: "Annonce non trouvée ou accès refusé" }, { status: 403 });
    }

    const results = await syncCalendar(id);

    return Response.json({ results });
  } catch (error) {
    console.error("POST /api/listings/[id]/sync/refresh error:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
