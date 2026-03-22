"use client";

import { ListingForm } from "../listing-form";

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-navy">
          Nouvelle annonce
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          Creez une nouvelle annonce pour votre lieu d&apos;exception
        </p>
      </div>

      <ListingForm mode="create" />
    </div>
  );
}
