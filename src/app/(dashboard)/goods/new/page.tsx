// This page allows users to add a new good to their inventory. It includes a back button to return to the goods list, a header with the page title and description, 
// and the GoodForm component where users can input the details of the new good. The design is clean and user-friendly, using Tailwind CSS for styling and Lucide icons for visual cues.
"use client";

import { GoodForm } from "@/components/GoodForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewGoodPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/goods" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Good</h2>
          <p className="text-sm text-gray-500">Define a new item in your inventory catalogue.</p>
        </div>
      </div>

      <GoodForm />
    </div>
  );
}
