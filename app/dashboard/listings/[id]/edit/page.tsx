import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EditListingClient } from "./edit-client";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "host") {
    redirect("/login");
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!listing || listing.hostId !== session.user.id) {
    redirect("/dashboard/listings");
  }

  const amenities: string[] = (() => {
    try {
      return JSON.parse(listing.amenities);
    } catch {
      return [];
    }
  })();

  const initialData = {
    title: listing.title,
    description: listing.description,
    type: listing.type,
    location: listing.location,
    address: listing.address ?? "",
    latitude: listing.latitude?.toString() ?? "",
    longitude: listing.longitude?.toString() ?? "",
    pricePerNight: listing.pricePerNight.toString(),
    capacity: listing.capacity.toString(),
    amenities,
    isPublished: listing.isPublished,
    imageUrls: listing.images.length > 0
      ? listing.images.map((img) => img.url)
      : [""],
  };

  return (
    <EditListingClient
      listingId={id}
      listingTitle={listing.title}
      initialData={initialData}
    />
  );
}
