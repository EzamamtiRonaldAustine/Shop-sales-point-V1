import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import * as xlsx from "xlsx";

export async function GET() {
  try {
    // Restrict to ADMIN or SUPER_ADMIN
    const { user, error } = await requireRole("ADMIN");
    if (error) return error;

    // Fetch all required data
    const [goods, sales, investments] = await Promise.all([
      db.good.findMany({
        orderBy: { name: "asc" },
      }),
      db.saleEntry.findMany({
        include: { good: true, user: true },
        orderBy: { saleDate: "desc" },
      }),
      db.investmentLog.findMany({
        include: { good: true, user: true },
        orderBy: { date: "desc" },
      }),
    ]);

    // Create a new workbook
    const workbook = xlsx.utils.book_new();

    // 1. Goods Sheet
    const goodsData = goods.map(g => ({
      "ID": g.id,
      "Name": g.name,
      "Unit Type": g.unitType,
      "Cost Price": Number(g.costPrice),
      "Selling Price": Number(g.sellingPrice),
      "Current Stock": Number(g.currentStock),
      "Created At": g.createdAt.toISOString().split("T")[0],
    }));
    const goodsSheet = xlsx.utils.json_to_sheet(goodsData);
    xlsx.utils.book_append_sheet(workbook, goodsSheet, "Goods Catalogue");

    // 2. Sales Sheet
    const salesData = sales.map(s => ({
      "Sale ID": s.id,
      "Date": s.saleDate.toISOString().split("T")[0],
      "Good Name": s.good.name,
      "Quantity Sold": Number(s.quantity),
      "Total Revenue": Number(s.totalRevenue),
      "Logged By": s.user.name || s.user.email,
      "Notes": s.note || "",
    }));
    const salesSheet = xlsx.utils.json_to_sheet(salesData);
    xlsx.utils.book_append_sheet(workbook, salesSheet, "Sales History");

    // 3. Investments Sheet
    const investmentsData = investments.map(i => ({
      "Log ID": i.id,
      "Date": i.date.toISOString().split("T")[0],
      "Good (if specific)": i.good?.name || "General/Misc",
      "Amount Spent": Number(i.amountSpent),
      "Quantity Added": i.quantityAdded ? Number(i.quantityAdded) : "",
      "Logged By": i.user.name || i.user.email,
      "Notes": i.note || "",
    }));
    const investmentsSheet = xlsx.utils.json_to_sheet(investmentsData);
    xlsx.utils.book_append_sheet(workbook, investmentsSheet, "Investments");

    // Generate buffer
    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    // Return as downloadable file
    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    headers.set("Content-Disposition", `attachment; filename="Shop_Report_${new Date().toISOString().split("T")[0]}.xlsx"`);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Excel Export Error:", error);
    return NextResponse.json({ message: "Failed to generate report" }, { status: 500 });
  }
}
