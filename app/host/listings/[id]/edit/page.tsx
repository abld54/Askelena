import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { ListingForm } from "@/components/host/ListingForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!listing) notFound();
  if (listing.hostId !== session.user.id) redirect("/host/listings");

  let amenities: string[] = [];
  try {
    amenities = JSON.parse(listing.amenities);
  } catch {
    amenities = [];
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/host/listings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0F2044] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Mes annonces
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-start justify-between mb-2">
            <h1
              className="text-2xl font-semibold text-[#0F2044]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Modifier l'annonce
            </h1>
          </div>
          <p className="text-sm text-gray-500 mb-8 truncate">{listing.title}</p>

          <ListingForm
            mode="edit"
            initialData={{
              id: listing.id,
              title: listing.title,
              description: listing.description,
              type: listing.type,
              location: listing.location,
              address: listing.address ?? "",
              pricePerNight: listing.pricePerNight,
              capacity: listing.capacity,
              amenities,
              isPublished: listing.isPublished,
              images: listing.images.map((img) => ({
                id: img.id,
                url: img.url,
                alt: img.alt,
              })),
            }}
          />
        </div>
      </div>
    </main>
  );
}
