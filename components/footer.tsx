"use client";

import React from "react";
import Link from "next/link";
import { openCookiePreferences } from "@/lib/cookie-consent";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border-subtle py-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-center items-start lg:justify-between  gap-4 w-full">
          <h4 className="font-bold text-primary tracking-tight order-1">Skillsy</h4>

          <div className="order-2 lg:order-3 flex flex-col md:flex-row gap-4 lg:gap-6 text-text-muted items-start justify-startw-full">
            <Link
              href="/noticias"
              className="hover:text-blue-600 text-gray-700 transition-colors text-sm font-normal"
            >
              Notícias
            </Link>
            <Link
              href="/join"
              className="hover:text-blue-600 text-gray-700 transition-colors text-sm font-normal"
            >
              Participe
            </Link>
            <Link
              href="/termos"
              className="hover:text-blue-600 text-gray-700 transition-colors text-sm font-normal"
            >
              Termos
            </Link>
            <Link
              href="/privacidade"
              className="hover:text-blue-600 text-gray-700 transition-colors text-sm font-normal"
            >
              Privacidade
            </Link>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-blue-600 text-gray-700 transition-colors text-sm font-normal"
            >
              Cookies
            </button>
          </div>
          <p className="order-3 lg:order-2 text-text-muted text-center text-xs md:text-left">
            © 2026 <strong>Skillsy</strong>. Criado para fortalecer a comunidade
          </p>
        </div>
      </div>
    </footer>
  );
}
