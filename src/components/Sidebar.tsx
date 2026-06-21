"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, TrendingUp, DollarSign, BarChart3, LogOut, Users } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

const ROLE_ORDER = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];

function hasMinRole(userRole: string, minimum: string): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minimum);
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, minRole: "STAFF" },
  { name: "Goods Catalogue", href: "/goods", icon: Package, minRole: "STAFF" },
  { name: "Daily Sales", href: "/sales", icon: TrendingUp, minRole: "STAFF" },
  { name: "Investments & Restock", href: "/investments", icon: DollarSign, minRole: "MANAGER" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, minRole: "ADMIN" },
  { name: "Super Admin", href: "/super-admin", icon: Users, minRole: "SUPER_ADMIN" },
];

export function Sidebar({ role = "STAFF" }: { role?: string }) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item => hasMinRole(role, item.minRole));

  return (
    // The Sidebar uses a persistent dark slate background (bg-slate-800) even in light mode 
    // to provide a more premium and professional aesthetic. In true dark mode, it switches 
    // to a deeper gray (dark:bg-gray-900).
    <div className="flex h-full w-64 flex-col bg-slate-800 dark:bg-gray-900 border-r border-slate-700 dark:border-gray-800 transition-colors duration-200">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-700 dark:border-gray-800">
        <h1 className="text-xl font-bold text-white tracking-tight">DailySales</h1>
      </div>
      <div className="px-6 py-4">
        <span className="inline-flex items-center rounded-md bg-slate-700 dark:bg-blue-400/10 px-2 py-1 text-xs font-medium text-slate-200 dark:text-blue-400 ring-1 ring-inset ring-slate-600 dark:ring-blue-400/30">
          Role: {role}
        </span>
      </div>
      <nav className="flex flex-1 flex-col px-4 pt-2 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                     // Active and hover states are carefully tuned to contrast against the dark 
                     // slate background without relying on standard light-mode text colors.
                     isActive
                       ? "bg-slate-700 text-white dark:bg-gray-800 dark:text-white"
                       : "text-slate-300 dark:text-gray-400 hover:bg-slate-700/60 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white",
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-blue-400 dark:text-white" : "text-slate-400 group-hover:text-white dark:group-hover:text-white",
                      "h-5 w-5 shrink-0"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
          
          <li className="mt-auto space-y-2">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-red-400 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="h-5 w-5 shrink-0 text-red-400 dark:text-red-400" aria-hidden="true" />
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
