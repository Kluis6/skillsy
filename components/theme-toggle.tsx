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
      size="icon"
      className="size-10 transition-discrete"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <BsMoon className="size-[18px]" /> : <BsSun className="text-foreground size-[18px]" />}

      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
