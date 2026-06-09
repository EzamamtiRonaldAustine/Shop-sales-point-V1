// This page allows users to log new sales and automatically update inventory stock.
// It fetches the list of goods for selection, validates input using Zod, and provides feedback on success or error. 
// The profit from each sale is calculated and displayed after logging a sale.
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, type SaleInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { TrendingUp, ShoppingCart } from "lucide-react";

type Good = { id: string; name: string; unitType: string; packagingDesc: string | null; currentStock: number; sellingPrice: number; costPrice: number };

export default function SalesPage() {
  const [goods, setGoods] = useState<Good[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastProfit, setLastProfit] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema) as any,
    defaultValues: { saleDate: new Date().toISOString().split("T")[0] },
  });

  const selectedGoodId = watch("goodId");
  const quantitySold = watch("quantity");
  
  const selectedGood = goods.find((g) => g.id === selectedGoodId);

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
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmit = async (data: SaleInput) => {
    if (selectedGood && data.quantity > selectedGood.currentStock) {
      setError(`Cannot sell ${data.quantity}. You only have ${selectedGood.currentStock} in stock!`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setLastProfit(null);

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to log sale");
      
      if (selectedGood) {
        const cost = selectedGood.costPrice * data.quantity;
        const revenue = selectedGood.sellingPrice * data.quantity;
        setLastProfit(revenue - cost);
      }

      setSuccess(true);
      reset({ goodId: "", quantity: 0, saleDate: new Date().toISOString().split("T")[0], note: "" });
      fetchGoods(); // Refresh stock immediately
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daily Sales</h2>
        <p className="text-sm text-gray-500">Record a sale, track profits, and auto-deduct from stock.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
            New Sale Entry
          </CardTitle>
          <CardDescription>
            Select a good to sell. The remaining stock will automatically update.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700">Good / Item</label>
              <select
                {...register("goodId")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Item to Sell --</option>
                {goods.map((good) => (
                  <option key={good.id} value={good.id}>
                    {good.name} {good.packagingDesc ? `(${good.packagingDesc})` : ""} - Stock: {good.currentStock}
                  </option>
                ))}
              </select>
              {errors.goodId && <span className="text-sm text-red-500">{errors.goodId.message}</span>}
            </div>

            {selectedGood && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                 <div>
                    <p className="text-xs text-gray-500 font-medium">Current Stock</p>
                    <p className="text-lg font-bold text-gray-900">{selectedGood.currentStock} <span className="text-sm font-normal text-gray-500">{selectedGood.unitType}</span></p>
                 </div>
                 <div>
                    <p className="text-xs text-gray-500 font-medium">Selling Price</p>
                    <p className="text-lg font-bold text-green-600">${selectedGood.sellingPrice}</p>
                 </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={`Quantity Sold ${selectedGood ? `(${selectedGood.unitType})` : ""}`}
                type="number"
                step="0.001"
                placeholder="e.g. 5"
                {...register("quantity")}
                error={errors.quantity?.message}
              />

              <Input
                label="Date"
                type="date"
                {...register("saleDate")}
                error={errors.saleDate?.message}
              />
            </div>

            {selectedGood && quantitySold > 0 && (
              <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-100 text-sm">
                 <span className="font-medium text-green-800">Auto-calculated Revenue:</span>
                 <span className="font-bold text-green-700">${(selectedGood.sellingPrice * (quantitySold || 0)).toFixed(2)}</span>
              </div>
            )}

            <Input
              label="Note (Optional)"
              placeholder="e.g. Sold to regular customer"
              {...register("note")}
              error={errors.note?.message}
            />

            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            
            {success && (
              <div className="text-green-800 text-sm font-medium bg-green-100 p-4 rounded-md flex flex-col gap-1">
                <div className="flex items-center"><ShoppingCart className="w-4 h-4 mr-2"/> Sale logged successfully! Stock deducted.</div>
                {lastProfit !== null && <div className="text-green-700 ml-6 text-xs">Profit generated from this sale: <strong>${lastProfit.toFixed(2)}</strong></div>}
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500">
              {isLoading ? "Saving..." : "Log Sale"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
