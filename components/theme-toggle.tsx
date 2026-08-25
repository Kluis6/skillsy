"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { BsMoon, BsSun } from "react-icons/bs";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="transition-discrete text-gray-700 dark:text-white"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <BsMoon className="size-4" /> : <BsSun className="size-4" />}

      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
