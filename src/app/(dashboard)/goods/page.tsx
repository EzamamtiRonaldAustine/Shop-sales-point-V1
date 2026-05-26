// This page displays the list of goods in the inventory. It fetches the goods data from the backend API and renders it in a table format. Each row shows the good's name, packaging details, unit type, stock remaining, cost price, selling price, and margin.
// The page also includes a button to add a new good, which navigates to the New Good page. Each good has action buttons for editing and deleting, although the delete functionality is not implemented yet. The design is clean and uses Tailwind CSS for styling, with hover effects for interactivity.
"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Good = {
  id: string;
  name: string;
  unitType: string;
  packagingDesc: string | null;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
};

export default function GoodsCatalogue() {
  const [goods, setGoods] = useState<Good[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGoods();
  }, []);

  const fetchGoods = async () => {
    try {
      const res = await fetch("/api/goods");
      if (res.ok) {
        const data = await res.json();
        setGoods(data);
      }
    } catch (error) {
      console.error("Failed to fetch goods");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Goods Catalogue</h2>
          <p className="text-sm text-gray-500">Manage your inventory, packaging, and pricing.</p>
        </div>
        <Link href="/goods/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Good
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Packaging / Details</th>
                <th className="px-6 py-4">Unit Type</th>
                <th className="px-6 py-4 text-right">Stock Remaining</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Selling Price</th>
                <th className="px-6 py-4 text-right">Margin</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : goods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No goods found. Click &quot;Add Good&quot; to start building your catalogue.
                  </td>
                </tr>
              ) : (
                goods.map((good) => {
                  const margin = good.sellingPrice - good.costPrice;
                  const marginPercent = good.costPrice > 0 ? (margin / good.costPrice) * 100 : 100;
                  
                  return (
                    <tr key={good.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">{good.name}</td>
                      <td className="px-6 py-4 text-gray-500">{good.packagingDesc || "—"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {good.unitType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {good.currentStock}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">${Number(good.costPrice).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">${Number(good.sellingPrice).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>
                          ${margin.toFixed(2)} ({marginPercent.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/goods/${good.id}/edit`}>
                            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                          </Link>
                          {/* We can add a delete button functionality later */}
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
