"use client";

import { ListingForm, type ListingFormData } from "../../listing-form";

type Props = {
  listingId: string;
  listingTitle: string;
  initialData: ListingFormData;
};

export function EditListingClient({ listingId, listingTitle, initialData }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-navy">
          Modifier l&apos;annonce
        </h2>
        <p className="mt-1 text-sm text-navy/60">
          {listingTitle}
        </p>
      </div>

      <ListingForm mode="edit" listingId={listingId} initialData={initialData} />
    </div>
  );
}
