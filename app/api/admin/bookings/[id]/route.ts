import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, listing: { hostId: session.user.id } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reservation introuvable" }, { status: 404 });
  }

  const body = await request.json();
  const { status } = body;

  if (!["confirmed", "cancelled", "completed"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "confirmed") updateData.confirmedAt = new Date();
  if (status === "cancelled") updateData.cancelledAt = new Date();

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
