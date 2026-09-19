"use client";

import Link from "next/link";
import { openCookiePreferences } from "@/lib/cookie-consent";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-card py-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between  gap-4 w-full">
          <h4 className="font-bold text-text-main tracking-tight order-1">Skillsy</h4>

          <div className="order-2 lg:order-3 flex flex-col md:flex-row gap-4 lg:gap-6 text-text-muted items-start">
            <Link
              href="/artigosevagas"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              Novidades e vagas
            </Link>
            <Link
              href="/join"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              Participe
            </Link>
            <Link
              href="/termos"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              Termos
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              Privacidade
            </Link>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-primary text-text-muted transition-colors text-sm font-normal"
            >
              Cookies
            </button>
          </div>
          <p className="order-3 lg:order-2 text-text-muted text-center text-xs md:text-left">
            © {new Date().getFullYear()} <strong>Skillsy</strong>. Criado para fortalecer a comunidade
          </p>
        </div>
      </div>
    </footer>
  );
}
