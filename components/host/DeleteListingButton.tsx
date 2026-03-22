"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  listingId: string;
  listingTitle: string;
}

export function DeleteListingButton({ listingId, listingTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      // Auto-reset after 3s if user doesn't confirm
      setTimeout(() => setConfirming(false), 3000);
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      }
      setConfirming(false);
    });
  }

  return (
    <Button
      variant="ghost"
      size={confirming ? "sm" : "icon"}
      onClick={handleClick}
      disabled={isPending}
      className={confirming ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-gray-400 hover:text-red-500"}
      title={confirming ? `Confirmer la suppression de "${listingTitle}"` : "Supprimer"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="w-4 h-4" />
          {confirming && <span className="ml-1 text-xs">Confirmer</span>}
        </>
      )}
    </Button>
  );
}
