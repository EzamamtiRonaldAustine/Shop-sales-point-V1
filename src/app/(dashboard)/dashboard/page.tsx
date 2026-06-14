import Link from "next/link";
import { BarChart3, DollarSign, Package, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";

const ROLE_ORDER = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"];

function hasMinRole(userRole: string, minimum: string): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minimum);
}

const quickLinks = [
  {
    title: "Goods Catalogue",
    description: "Add products, update stock, and review pricing.",
    href: "/goods",
    icon: Package,
    minRole: "STAFF",
  },
  {
    title: "Daily Sales",
    description: "Record sales and track what moved today.",
    href: "/sales",
    icon: TrendingUp,
    minRole: "STAFF",
  },
  {
    title: "Investments & Restock",
    description: "Log restock spending and new inventory.",
    href: "/investments",
    icon: DollarSign,
    minRole: "MANAGER",
  },
  {
    title: "Analytics",
    description: "Review performance, trends, and cash flow.",
    href: "/analytics",
    icon: BarChart3,
    minRole: "ADMIN",
  },
  {
    title: "Super Admin Panel",
    description: "Manage users, assign roles, and view login history.",
    href: "/super-admin",
    icon: Users,
    minRole: "SUPER_ADMIN",
  },
];

export default async function DashboardHome() {
  const session = await auth();
  const role = (session?.user as any)?.role || "STAFF";
  const name = session?.user?.name || "User";

  const allowedLinks = quickLinks.filter((item) => hasMinRole(role, item.minRole));

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Dashboard</p>
            <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20">
              Role: {role}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Welcome back, {name}. Your shop is ready.
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Use this space to move between your allowed sections based on your role.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/goods">
              <Button className="bg-white text-slate-950 hover:bg-slate-200 font-semibold transition-all">Open goods</Button>
            </Link>
            <Link href="/sales">
              <Button variant="outline" className="border-slate-500 text-white hover:bg-slate-800 hover:text-white transition-all">Record a sale</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {allowedLinks.map((item) => (
          <Link key={item.title} href={item.href} className="group block h-full">
            <Card className="h-full border-slate-200 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                  Open section →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
