import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateICalFeed } from "@/lib/ical-export";

type Params = { params: Promise<{ id: string }> };

// GET /api/listings/[id]/calendar.ics — Export iCal feed (public, no auth)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!listing) {
      return new Response("Annonce non trouvée", { status: 404 });
    }

    const icalContent = await generateICalFeed(id);

    return new Response(icalContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="askelena-${id}.ics"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("GET /api/listings/[id]/calendar.ics error:", error);
    return new Response("Erreur interne du serveur", { status: 500 });
  }
}
