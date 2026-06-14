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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Review shop-wide performance, trends, and cash flow.</p>
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
