// This layout component defines the overall structure of the dashboard, including a sidebar for navigation and a main content area where different pages (like sales, investments, etc.) will be rendered. 
// The sidebar is imported from a separate component file, and the main content area is designed to be scrollable if the content exceeds the viewport height.
import { Sidebar } from "@/components/Sidebar";
import { AutoLogout } from "@/components/AutoLogout";
import { auth } from "@/lib/auth";
import ChangePasswordPopup from "@/components/ChangePasswordPopup";

// The DashboardLayout component is an async function that retrieves the user's session information to determine their role and whether they need to change their password. It then renders the layout with the sidebar and main content area, and conditionally displays a password change popup if required.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as any)?.role || "STAFF";
  const requiresPasswordChange = (session?.user as any)?.requiresPasswordChange;

  // The layout consists of a flex container that takes up the full height of the screen. The sidebar is rendered on the left, and the main content area is on the right. If the user needs to change their password, a semi-transparent overlay with a password change popup is displayed on top of the main content.
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AutoLogout />
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
        {requiresPasswordChange && (
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <ChangePasswordPopup />
          </div>
        )}
      </div>
    </div>
  );
}
