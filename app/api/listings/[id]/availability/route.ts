import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUnavailableDates } from "@/lib/booking";

type Params = { params: Promise<{ id: string }> };

// GET /api/listings/[id]/availability
// Returns array of unavailable ISO date strings
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, isPublished: true },
  });

  if (!listing || !listing.isPublished) {
    return Response.json({ error: "Annonce non trouvée" }, { status: 404 });
  }

  const unavailable = await getUnavailableDates(id);

  // Deduplicate and return as ISO strings
  const unique = Array.from(
    new Map(unavailable.map((d) => [d.toISOString().split("T")[0], d])).values()
  );

  return Response.json(unique.map((d) => d.toISOString().split("T")[0]));
}
