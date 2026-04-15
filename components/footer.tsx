'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border-subtle py-12 px-6 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-text-main tracking-tight">Skillsy</span>
        </div>
        <p className="text-text-muted text-center md:text-left">
          © 2026 Skillsy. Criado para fortalecer a comunidade SUD. <br className="md:hidden" />
          <span className="text-primary font-bold">Plataforma 100% sem fins lucrativos.</span>
        </p>
        <div className="flex gap-6 text-text-muted">
          <a href="#" className="hover:text-primary transition-colors">Termos</a>
          <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
        </div>
      </div>
    </footer>
  );
}
