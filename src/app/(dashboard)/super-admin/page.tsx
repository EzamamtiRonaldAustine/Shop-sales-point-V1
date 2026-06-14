import { redirect } from "next/navigation";
import { requireRole } from "@/lib/requireRole";
import SuperAdminClient from "./SuperAdminClient";

export const metadata = {
  title: "Super Admin Panel | DailySales",
};

export default async function SuperAdminPage() {
  const { user, error } = await requireRole("SUPER_ADMIN");
  
  if (error) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Super Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-1">Manage users, assign roles, and view login history across the system.</p>
      </div>

      <SuperAdminClient currentUser={user} />
    </div>
  );
}
