// This layout component defines the overall structure of the dashboard, including a sidebar for navigation and a main content area where different pages (like sales, investments, etc.) will be rendered. 
// The sidebar is imported from a separate component file, and the main content area is designed to be scrollable if the content exceeds the viewport height.
import { Sidebar } from "@/components/Sidebar";
import { AutoLogout } from "@/components/AutoLogout";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role || "STAFF";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AutoLogout />
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
