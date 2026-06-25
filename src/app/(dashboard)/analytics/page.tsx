import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";

export const metadata = {
  title: "Analytics | DailySales",
};

export default async function AnalyticsPage() {
  const { user, error } = await requireRole("ADMIN");
  if (error) {
    redirect("/dashboard"); // Unauthorized, send back to dashboard
  }

  // Fetch all data across the shop since this is an ADMIN level view
  const [sales, investments] = await Promise.all([
    db.saleEntry.findMany({
      include: { good: true },
      orderBy: { saleDate: "asc" },
    }),
    db.investmentLog.findMany({
      orderBy: { date: "asc" },
    }),
  ]);

  // Aggregate Total Revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalRevenue), 0);
  
  // Aggregate Total Investments
  const totalInvestment = investments.reduce((sum, inv) => sum + Number(inv.amountSpent), 0);

  // Aggregate Sales by Date (for Line Chart)
  const salesByDateMap = new Map<string, number>();
  sales.forEach((sale) => {
    // Format date as YYYY-MM-DD
    const dateStr = sale.saleDate.toISOString().split("T")[0];
    const current = salesByDateMap.get(dateStr) || 0;
    salesByDateMap.set(dateStr, current + Number(sale.totalRevenue));
  });

  const salesOverTime = Array.from(salesByDateMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Aggregate Top Selling Goods (for Bar Chart)
  const goodsSalesMap = new Map<string, { name: string; totalRevenue: number; quantity: number }>();
  sales.forEach((sale) => {
    const goodId = sale.goodId;
    const goodName = sale.good.name;
    const current = goodsSalesMap.get(goodId) || { name: goodName, totalRevenue: 0, quantity: 0 };
    goodsSalesMap.set(goodId, {
      name: goodName,
      totalRevenue: current.totalRevenue + Number(sale.totalRevenue),
      quantity: current.quantity + Number(sale.quantity),
    });
  });

  const topSellingGoods = Array.from(goodsSalesMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5); // top 5

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review shop-wide performance, trends, and cash flow.</p>
        </div>
        <a
          href="/api/analytics/export"
          download
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download Excel Report
        </a>
      </div>

      <AnalyticsCharts 
        totalRevenue={totalRevenue}
        totalInvestment={totalInvestment}
        salesOverTime={salesOverTime}
        topSellingGoods={topSellingGoods}
      />
    </div>
  );
}
