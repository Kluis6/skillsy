"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { BsMoon, BsSun } from "react-icons/bs";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-10 transition-discrete"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <BsMoon /> : <BsSun className="text-gray-800" />}

      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
