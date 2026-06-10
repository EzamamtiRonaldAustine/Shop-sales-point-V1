"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, TrendingUp, Package, BarChart3 } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend
} from "recharts";

type SalesOverTimeData = {
  date: string;
  amount: number;
};

type TopSellingGoodData = {
  name: string;
  totalRevenue: number;
  quantity: number;
};

interface AnalyticsChartsProps {
  totalRevenue: number;
  totalInvestment: number;
  salesOverTime: SalesOverTimeData[];
  topSellingGoods: TopSellingGoodData[];
}

export default function AnalyticsCharts({ 
  totalRevenue, 
  totalInvestment, 
  salesOverTime, 
  topSellingGoods 
}: AnalyticsChartsProps) {
  
  const netProfit = totalRevenue - totalInvestment;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">From all recorded sales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvestment.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Restocks and capital spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(netProfit).toFixed(2)} {netProfit >= 0 ? '(Profit)' : '(Loss)'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Revenue vs Investments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Over Time Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>Daily revenue trends.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            {salesOverTime.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                No sales data available to chart.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Goods Chart */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Goods</CardTitle>
            <CardDescription>By total revenue generated.</CardDescription>
          </CardHeader>
          <CardContent>
            {topSellingGoods.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingGoods} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      fontSize={12}
                      width={100}
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                    />
                    <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-gray-500">
                No goods data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
