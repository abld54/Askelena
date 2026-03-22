import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-8">
          Mon profil
        </h1>
        <ProfileForm user={session.user} />
      </div>
    </div>
  );
}
