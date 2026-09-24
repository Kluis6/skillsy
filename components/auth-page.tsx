"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";

/**
 * Full-page entry for links to /signin and /recovery: opens the auth modal on
 * the right tab and sends signed-in members to their profile. Closing it
 * without signing in goes back home.
 */
export function AuthPage({ defaultTab }: { defaultTab: "login" | "signup" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/profile");
  }, [loading, user, router]);

  return (
    <main className="min-h-screen bg-surface">
      <AuthModal
        open={!user}
        defaultTab={defaultTab}
        onOpenChange={(open) => {
          if (open) return;
          // The modal also closes itself after a successful sign-in.
          if (auth.currentUser) router.replace("/profile");
          else router.push("/");
        }}
      />
    </main>
  );
}
