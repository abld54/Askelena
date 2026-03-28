import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id, imageId } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, hostId: session.user.id },
  });
  if (!listing) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
  }

  await prisma.image.delete({ where: { id: imageId } });

  return NextResponse.json({ ok: true });
}
