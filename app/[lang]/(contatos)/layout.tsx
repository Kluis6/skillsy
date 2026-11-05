import { SidebarProvider } from "@/components/ui/sidebar";
import { CSSProperties } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          // Wide enough for full contact names (the default is 16rem).
          "--sidebar-width": "24rem",
        } as CSSProperties
      }
    >
      <main className="h-full">
  
        {children}
      </main>
    </SidebarProvider>
  );
}
