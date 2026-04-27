"use client";

import { ReactElement, cloneElement, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

function SidebarToggleButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={toggleSidebar}
    >
      Abrir / fechar sidebar
    </Button>
  );
}

interface AppSidebarProps {
  children?: ReactElement<{ onContactToggle?: () => void }>;
}

export function AppSidebar({ children }: AppSidebarProps) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  const handleContactToggle = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

  const content = isValidElement(children)
    ? cloneElement(children, { onContactToggle: handleContactToggle })
    : children;

  return (
    <Sidebar>
     
      <SidebarContent className="md:w-full w-screen">{content}</SidebarContent>
      
    </Sidebar>
  );
}
