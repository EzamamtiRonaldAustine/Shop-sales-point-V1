// This page displays the list of goods in the inventory. It fetches the goods data from the backend API and renders it in a table format. Each row shows the good's name, packaging details, unit type, stock remaining, cost price, selling price, and margin.
// The page also includes a button to add a new good, which navigates to the New Good page. Each good has action buttons for editing and deleting, although the delete functionality is not implemented yet. The design is clean and uses Tailwind CSS for styling, with hover effects for interactivity.
"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { Plus, Edit, Trash2, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
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
  const [sortColumn, setSortColumn] = useState<keyof Good | 'margin'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<'none' | 'unitType' | 'packagingDesc'>('none');

  const handleSort = (column: keyof Good | 'margin') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedGoods = useMemo(() => {
    return [...goods].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof Good];
      let bVal: any = b[sortColumn as keyof Good];

      if (sortColumn === 'margin') {
        aVal = a.sellingPrice - a.costPrice;
        bVal = b.sellingPrice - b.costPrice;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [goods, sortColumn, sortDirection]);

  const groupedGoods = useMemo(() => {
    if (groupBy === 'none') {
      return { "All Goods": sortedGoods };
    }
    const groups: Record<string, Good[]> = {};
    sortedGoods.forEach(good => {
      const key = good[groupBy as keyof Good] as string || "Unspecified";
      if (!groups[key]) groups[key] = [];
      groups[key].push(good);
    });
    return groups;
  }, [sortedGoods, groupBy]);

  const renderSortIcon = (column: keyof Good | 'margin') => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400 opacity-50" />;
    return sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3 text-blue-500" /> : <ChevronDown className="ml-1 h-3 w-3 text-blue-500" />;
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Goods Catalogue</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your inventory, packaging, and pricing.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="h-10 rounded-md border border-gray-300 bg-white dark:bg-slate-950 px-3 text-sm text-gray-900 dark:text-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          >
            <option value="none">No Grouping</option>
            <option value="unitType">Group by Unit Type</option>
            <option value="packagingDesc">Group by Packaging</option>
          </select>
          <Link href="/goods/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Good
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center">Item Name {renderSortIcon('name')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors" onClick={() => handleSort('packagingDesc')}>
                  <div className="flex items-center">Packaging {renderSortIcon('packagingDesc')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors" onClick={() => handleSort('unitType')}>
                  <div className="flex items-center">Unit Type {renderSortIcon('unitType')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors text-right" onClick={() => handleSort('currentStock')}>
                  <div className="flex items-center justify-end">Stock {renderSortIcon('currentStock')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors text-right" onClick={() => handleSort('costPrice')}>
                  <div className="flex items-center justify-end">Cost Price {renderSortIcon('costPrice')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors text-right" onClick={() => handleSort('sellingPrice')}>
                  <div className="flex items-center justify-end">Selling Price {renderSortIcon('sellingPrice')}</div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors text-right" onClick={() => handleSort('margin')}>
                  <div className="flex items-center justify-end">Margin {renderSortIcon('margin')}</div>
                </th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : goods.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No goods found. Click &quot;Add Good&quot; to start building your catalogue.
                  </td>
                </tr>
              ) : (
                Object.entries(groupedGoods).map(([group, groupItems]) => (
                  <Fragment key={group}>
                    {groupBy !== 'none' && (
                      <tr className="bg-gray-100 dark:bg-slate-800/80 border-y border-gray-200 dark:border-slate-700">
                        <td colSpan={8} className="px-6 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                          {group} ({groupItems.length})
                        </td>
                      </tr>
                    )}
                    {groupItems.map((good) => {
                      const margin = good.sellingPrice - good.costPrice;
                      const marginPercent = good.costPrice > 0 ? (margin / good.costPrice) * 100 : 100;
                      
                      return (
                        <tr key={good.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{good.name}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{good.packagingDesc || "—"}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
                              {good.unitType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-gray-100">
                            {good.currentStock}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400">${Number(good.costPrice).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-gray-100 font-medium">${Number(good.sellingPrice).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-medium ${margin >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
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
                    })}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
