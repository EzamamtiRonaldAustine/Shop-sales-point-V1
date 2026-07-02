// This page allows users to log new investments (purchases) and optionally restock inventory items in one step. 
// It fetches the list of goods for selection, validates input using Zod, and provides feedback on success or error.
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { investmentSchema, type InvestmentInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, PlusCircle } from "lucide-react";

type Good = { id: string; name: string; unitType: string; packagingDesc: string | null };

export default function InvestmentPage() {
  const [goods, setGoods] = useState<Good[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema) as any,
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  });

  const selectedGoodId = watch("goodId");
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

  const onSubmit = async (data: InvestmentInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to log investment");
      
      setSuccess(true);
      reset();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Investments & Restocking</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Log purchases and instantly update your inventory stock.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center dark:text-white">
            <DollarSign className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-500" />
            New Investment Entry
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Select a good to restock it, or leave it unselected for a general business expense.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Good / Item (Optional)</label>
              <select
                {...register("goodId")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                <option value="">-- General Expense --</option>
                {goods.map((good) => (
                  <option key={good.id} value={good.id}>
                    {good.name} {good.packagingDesc ? `(${good.packagingDesc})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount Spent (UGX)"
                type="number"
                step="0.01"
                placeholder="e.g. 150.00"
                {...register("amountSpent")}
                error={errors.amountSpent?.message}
              />

              <Input
                label="Date"
                type="date"
                {...register("date")}
                error={errors.date?.message}
              />
            </div>

            {selectedGoodId && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50 transition-colors">
                <Input
                  label={`Quantity Added to Stock (${selectedGood?.unitType || "Units"})`}
                  type="number"
                  step="0.001"
                  placeholder={`e.g. 50 (if buying 50 ${selectedGood?.unitType?.toLowerCase()})`}
                  {...register("quantityAdded")}
                  error={errors.quantityAdded?.message}
                />
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  This will automatically increase your current stock for {selectedGood?.name}.
                </p>
              </div>
            )}

            <Input
              label="Note (Optional)"
              placeholder="e.g. Bought from main supplier"
              {...register("note")}
              error={errors.note?.message}
            />

            {error && <div className="text-red-500 dark:text-red-400 text-sm font-medium">{error}</div>}
            {success && <div className="text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-950/50 p-3 rounded-md transition-colors">Investment logged successfully! Stock updated.</div>}

            <Button type="submit" disabled={isLoading} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Log Investment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
