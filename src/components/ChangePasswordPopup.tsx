"use client";

/**
 * ChangePasswordPopup Component
 * 
 * This is a security enforcement component that appears when a user logs in
 * with a default or compromised password (indicated by the `requiresPasswordChange` flag).
 * 
 * It forces the user to set a new password. Upon successful password change,
 * it dynamically updates the active NextAuth session and triggers a server-side
 * refresh to remove the modal overlay without requiring a full page reload or
 * a completely new login cycle.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldAlert } from "lucide-react";
import { signOut, useSession, SessionProvider } from "next-auth/react";

function ChangePasswordForm() {
  const router = useRouter();
  
  // useSession hook allows us to access the `update` method, which can mutate
  // the current session token in the browser and re-trigger the JWT callback on the server.
  const { update } = useSession();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // Send the new password to our API route which handles hashing and DB updates
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to change password.");
        setIsLoading(false);
        return;
      }

      // Success! The database is updated.
      // Now we call update() to modify the client-side session and cookie, 
      // explicitly setting requiresPasswordChange to false so the NextAuth JWT callback syncs it.
      await update({ requiresPasswordChange: false });
      
      // Refresh Next.js server components (like layout.tsx) to re-evaluate the layout 
      // checks and remove the overlay wrapper immediately.
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-orange-200">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit">
          <ShieldAlert className="w-8 h-8 text-orange-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Action Required</CardTitle>
        <CardDescription>
          For security reasons, you must change your one-time default password before accessing the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            {/* If the user refuses to change the password, their only option is to sign out */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign Out
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Confirm Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * We wrap the form in a local SessionProvider.
 * Because the root application layout doesn't use a global SessionProvider (to preserve Server Components),
 * this local wrapper is required so that `useSession()` works within the ChangePasswordForm.
 */
export default function ChangePasswordPopup() {
  return (
    <SessionProvider>
      <ChangePasswordForm />
    </SessionProvider>
  );
}


