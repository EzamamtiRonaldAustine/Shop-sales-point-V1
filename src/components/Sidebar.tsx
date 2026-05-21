"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, TrendingUp, DollarSign, BarChart3, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Goods Catalogue", href: "/goods", icon: Package },
  { name: "Daily Sales", href: "/sales", icon: TrendingUp },
  { name: "Investments & Restock", href: "/investments", icon: DollarSign },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 border-r border-gray-800">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-white tracking-tight">DailySales</h1>
      </div>
      <nav className="flex flex-1 flex-col px-4 pt-4 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white",
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white",
                      "h-5 w-5 shrink-0"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
          
          <li className="mt-auto">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-white" aria-hidden="true" />
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
