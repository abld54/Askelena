"use client";

import { Suspense } from "react";
import EditClient from "./EditClient";

export default function EditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-white">Chargement...</div>}>
      <EditClient />
    </Suspense>
  );
}
