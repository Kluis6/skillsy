import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { CSSProperties } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width-mobile": "100vw",
          "--sidebar-width-desktop": "50vw",
        } as CSSProperties
      }
    >
      <main className="">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
