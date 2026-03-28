import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = session.user as { id: string; role: string };
    if (user.role !== "host") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });
    if (!listing || listing.hostId !== user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    const syncs = await prisma.calendarSync.findMany({
      where: { listingId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(syncs);
  } catch (error) {
    console.error("GET /api/calendar-sync error:", error);
    return NextResponse.json({ error: "Failed to fetch sync status" }, { status: 500 });
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { listingId, syncId } = body;

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });
    if (!listing || listing.hostId !== user.id) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    // If syncId provided, trigger sync for that specific calendar
    // Otherwise, trigger all syncs for the listing
    const where = syncId
      ? { id: syncId, listingId }
      : { listingId, isActive: true };

    const syncs = await prisma.calendarSync.findMany({ where });

    const results = [];
    for (const sync of syncs) {
      try {
        const response = await fetch(sync.icalUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const icalData = await response.text();

        // Parse iCal events and create blocked dates
        const dateRegex = /DTSTART(?:;VALUE=DATE)?:(\d{4})(\d{2})(\d{2})/g;
        let match;
        const dates: Date[] = [];
        while ((match = dateRegex.exec(icalData)) !== null) {
          dates.push(new Date(`${match[1]}-${match[2]}-${match[3]}`));
        }

        // Upsert blocked dates
        for (const date of dates) {
          await prisma.blockedDate.upsert({
            where: {
              listingId_date: { listingId, date },
            },
            update: { source: "sync" },
            create: { listingId, date, source: "sync" },
          });
        }

        await prisma.calendarSync.update({
          where: { id: sync.id },
          data: { lastSyncAt: new Date(), lastError: null },
        });

        results.push({ syncId: sync.id, status: "success", datesImported: dates.length });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        await prisma.calendarSync.update({
          where: { id: sync.id },
          data: { lastError: errorMsg },
        });
        results.push({ syncId: sync.id, status: "error", error: errorMsg });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("POST /api/calendar-sync error:", error);
    return NextResponse.json({ error: "Failed to trigger sync" }, { status: 500 });
  }
}
