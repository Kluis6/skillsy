"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  COOKIE_PREFERENCES_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = window.setTimeout(() => {
      setVisible(readCookieConsent() === null);
    }, 3500);

    const handleOpenPreferences = () => {
      setVisible(true);
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, handleOpenPreferences);

    return () => {
      window.clearTimeout(syncVisibility);
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    };
  }, []);

  const handleChoice = (choice: "accepted" | "rejected") => {
    writeCookieConsent(choice);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-2xl">
        <div className="bg-linear-to-r from-blue-600 via-sky-500 to-cyan-400 px-5 py-3 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <ShieldCheck size={18} />
            Controle de cookies e preferencias
          </div>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm text-slate-700 md:px-6 md:py-5">
          <p>
            Esta plataforma salva cookies. Mais informacoes estao na nossa{" "}
            <Link
              className="font-semibold text-blue-700 underline underline-offset-4"
              href="/privacidade"
            >
              Politica de Privacidade
            </Link>
            .
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300"
              onClick={() => handleChoice("rejected")}
            >
              Fechar
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleChoice("accepted")}
            >
              Entendi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
