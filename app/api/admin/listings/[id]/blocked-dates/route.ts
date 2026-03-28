import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "host") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, hostId: session.user.id },
  });
  if (!listing) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 });
  }

  const body = await request.json();

  const blockedDate = await prisma.blockedDate.create({
    data: {
      date: new Date(body.date),
      source: "manual",
      listingId: id,
    },
  });

  return NextResponse.json(blockedDate, { status: 201 });
}
