"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goodSchema, type GoodInput, unitTypes } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PackagePlus } from "lucide-react";

export function GoodForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<GoodInput>({
    resolver: zodResolver(goodSchema) as any,
    defaultValues: { unitType: "PIECE" }
  });

  const selectedUnitType = watch("unitType");

  const onSubmit = async (data: GoodInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/goods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create good");
      
      router.push("/goods");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PackagePlus className="mr-2 h-5 w-5 text-blue-600" />
          Add New Good
        </CardTitle>
        <CardDescription>
          Define a new item in your inventory. You can restock it later in the Investments tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Item Name"
            placeholder="e.g. Sugar, Pens, Coca-Cola"
            {...register("name")}
            error={errors.name?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Unit Type</label>
              <select
                {...register("unitType")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              >
                {unitTypes.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <Input
              label="Packaging Details (Optional)"
              placeholder={`e.g. ${
                selectedUnitType === "TRAY" ? "Tray of 24" :
                selectedUnitType === "BOX" ? "Box of 50" :
                selectedUnitType === "KILOGRAM" ? "50kg Bag" : "Single Piece"
              }`}
              {...register("packagingDesc")}
              error={errors.packagingDesc?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Cost Price per ${selectedUnitType.toLowerCase()} (UGX)`}
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("costPrice")}
              error={errors.costPrice?.message}
            />

            <Input
              label={`Selling Price per ${selectedUnitType.toLowerCase()} (UGX)`}
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("sellingPrice")}
              error={errors.sellingPrice?.message}
            />
          </div>

          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save to Catalogue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
