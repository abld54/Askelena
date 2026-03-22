import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string; syncId: string }> };

// DELETE /api/listings/[id]/sync/[syncId] — Remove a sync
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id, syncId } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true, hostId: true },
    });

    if (!listing || listing.hostId !== session.user.id) {
      return Response.json({ error: "Annonce non trouvée ou accès refusé" }, { status: 403 });
    }

    const sync = await prisma.calendarSync.findUnique({
      where: { id: syncId },
    });

    if (!sync || sync.listingId !== id) {
      return Response.json({ error: "Synchronisation non trouvée" }, { status: 404 });
    }

    // Determine source tag for this platform
    const source = sync.platform === "airbnb" ? "airbnb" : sync.platform === "booking" ? "booking" : "sync";

    // Remove synced blocked dates from this source
    await prisma.blockedDate.deleteMany({
      where: { listingId: id, source },
    });

    // Delete the sync record
    await prisma.calendarSync.delete({
      where: { id: syncId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/listings/[id]/sync/[syncId] error:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
