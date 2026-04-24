"use client";

import React from "react";
import { toast } from "sonner";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border-subtle py-5">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center  gap-6 px-4">
        <h4 className="font-bold text-primary tracking-tight">Skillsy</h4>
        <p className="text-text-muted text-center text-xs md:text-left">
          © 2026 <strong>Skillsy</strong>. Criado para fortalecer a comunidade
        </p>
        <div className="flex gap-6 text-text-muted">
          <Link
            href="/join"
            className="hover:text-blue-600 text-gray-700 transition-colors text-sm font-normal"
          >
            Participe
          </Link>
          <Link
            href="/termos"
            className="hover:text-blue-600 text-gray-700 transition-colors text-sm"
          >
            Termos
          </Link>
          <Link
            href="/privacidade"
            className="hover:text-blue-600 text-gray-700 transition-colors text-sm"
          >
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
