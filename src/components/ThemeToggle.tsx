"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full flex items-center justify-start gap-3 bg-transparent border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {/* Sun icon for light mode */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-700 dark:text-gray-400" />
      {/* Moon icon for dark mode */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-700 dark:text-gray-400" />
      <span className="text-gray-700 dark:text-gray-300 font-medium">Toggle Theme</span>
    </Button>
  );
}
