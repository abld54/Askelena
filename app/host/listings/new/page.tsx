import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { ArrowLeft } from "lucide-react";
import { ListingForm } from "@/components/host/ListingForm";

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
          <h1
            className="text-2xl font-semibold text-[#0F2044] mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Créer une annonce
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Décrivez votre lieu et commencez à accueillir des voyageurs.
          </p>

          <ListingForm mode="create" />
        </div>
      </div>
    </main>
  );
}
