import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { syncCalendar } from "@/lib/sync-calendar";

type Params = { params: Promise<{ id: string }> };

// POST /api/listings/[id]/sync — Add a calendar sync
export async function POST(req: NextRequest, { params }: Params) {
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

    let body: { icalUrl: string; platform: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const { icalUrl, platform } = body;

    if (!icalUrl || typeof icalUrl !== "string") {
      return Response.json({ error: "icalUrl est requis" }, { status: 400 });
    }

    const validPlatforms = ["airbnb", "booking", "other"];
    if (!platform || !validPlatforms.includes(platform)) {
      return Response.json(
        { error: `platform doit être l'un de : ${validPlatforms.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(icalUrl);
    } catch {
      return Response.json({ error: "URL invalide" }, { status: 400 });
    }

    // Create the sync record
    const calendarSync = await prisma.calendarSync.create({
      data: {
        listingId: id,
        platform,
        icalUrl,
      },
    });

    // Immediately sync
    const results = await syncCalendar(id);

    return Response.json({ calendarSync, syncResults: results }, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings/[id]/sync error:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique")) {
      return Response.json(
        { error: "Cette URL iCal est déjà synchronisée pour cette annonce" },
        { status: 409 }
      );
    }

    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

// GET /api/listings/[id]/sync — List all syncs for a listing
export async function GET(_req: NextRequest, { params }: Params) {
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

    const syncs = await prisma.calendarSync.findMany({
      where: { listingId: id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(syncs);
  } catch (error) {
    console.error("GET /api/listings/[id]/sync error:", error);
    return Response.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
