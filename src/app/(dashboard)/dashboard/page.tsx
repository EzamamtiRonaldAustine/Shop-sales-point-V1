// This is the main dashboard page that users see after signing in. It provides a welcome message and quick links to the key sections of the app: Goods, Sales, Investments, and Analytics. 
// Each section is represented by a card with an icon, title, description, and a call-to-action to open that section. 
// The design uses Tailwind CSS for styling and includes hover effects for interactivity.
import Link from "next/link";
import { BarChart3, DollarSign, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const quickLinks = [
  {
    title: "Goods Catalogue",
    description: "Add products, update stock, and review pricing.",
    href: "/goods",
    icon: Package,
  },
  {
    title: "Daily Sales",
    description: "Record sales and track what moved today.",
    href: "/sales",
    icon: TrendingUp,
  },
  {
    title: "Investments & Restock",
    description: "Log restock spending and new inventory.",
    href: "/investments",
    icon: DollarSign,
  },
  {
    title: "Analytics",
    description: "Review performance, trends, and cash flow.",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Welcome back. Your shop data is connected and ready.
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Use this space to move between goods, sales, investments, and analytics. The Neon database is already wired up, so this page is your landing point after sign-in.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/goods">
              <Button className="bg-white text-slate-950 hover:bg-slate-100">Open goods</Button>
            </Link>
            <Link href="/sales">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">Record a sale</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link key={item.title} href={item.href} className="group block">
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
