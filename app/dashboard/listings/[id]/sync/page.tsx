import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SyncClient } from "./sync-client";

type Props = { params: Promise<{ id: string }> };

export default async function SyncPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "host") {
    redirect("/login");
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { id: true, title: true, hostId: true },
  });

  if (!listing || listing.hostId !== session.user.id) {
    redirect("/dashboard/listings");
  }

  const syncs = await prisma.calendarSync.findMany({
    where: { listingId: id },
    orderBy: { createdAt: "desc" },
  });

  // Build the export URL
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const exportUrl = `${baseUrl}/api/listings/${id}/calendar.ics`;

  return (
    <SyncClient
      listingId={id}
      listingTitle={listing.title}
      initialSyncs={syncs.map((s) => ({
        id: s.id,
        platform: s.platform,
        icalUrl: s.icalUrl,
        lastSyncAt: s.lastSyncAt?.toISOString() ?? null,
        lastError: s.lastError,
        isActive: s.isActive,
        createdAt: s.createdAt.toISOString(),
      }))}
      exportUrl={exportUrl}
    />
  );
}
