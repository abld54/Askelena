"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

export default function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"guest" | "host">(
    user.role === "host" ? "host" : "guest"
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, phone, role }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur lors de la sauvegarde.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex items-center gap-5">
        <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden bg-zinc-100">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ""} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-zinc-400">
              {(user.name ?? user.email ?? "?")[0].toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-zinc-900">{user.name ?? "—"}</p>
          <p className="text-sm text-zinc-500">{user.email}</p>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              user.role === "host"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {user.role === "host" ? "Hôte" : "Voyageur"}
          </span>
        </div>
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5"
      >
        <h2 className="text-base font-semibold text-zinc-900">
          Informations personnelles
        </h2>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {saved && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Profil mis à jour avec succès.
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 mb-1">
            Bio <span className="font-normal text-zinc-400">(optionnel)</span>
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            placeholder="Quelques mots sur vous…"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1">
            Téléphone <span className="font-normal text-zinc-400">(optionnel)</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="+33 6 00 00 00 00"
          />
        </div>

        <div>
          <p className="block text-sm font-medium text-zinc-700 mb-2">Rôle</p>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { value: "guest", label: "Voyageur", emoji: "🔍" },
                { value: "host", label: "Hôte", emoji: "🏠" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  role === option.value
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                <span>{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Sauvegarde…" : "Sauvegarder"}
        </button>
      </form>

      {/* Sign out */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Compte</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
