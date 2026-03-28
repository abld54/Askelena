import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, hostId: session.user.id },
    include: {
      images: { orderBy: { order: "asc" } },
      blockedDates: { orderBy: { date: "asc" } },
      calendarSyncs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
  }

  return NextResponse.json(listing);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.listing.findFirst({
    where: { id, hostId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
  }

  try {
    const body = await request.json();

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        location: body.location,
        address: body.address ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        pricePerNight: body.pricePerNight || 0,
        capacity: body.capacity || 1,
        amenities: body.amenities || "[]",
        isPublished: body.isPublished ?? false,
      },
    });

    return NextResponse.json(listing);
  } catch (err) {
    console.error("Update listing error:", err);
    return NextResponse.json({ error: "Erreur lors de la mise a jour" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.listing.findFirst({
    where: { id, hostId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
  }

  await prisma.listing.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
