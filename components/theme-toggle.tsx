"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { BsMoon, BsSun } from "react-icons/bs";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 transition-discrete"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <BsMoon /> : <BsSun className="text-gray-800" />}

      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
