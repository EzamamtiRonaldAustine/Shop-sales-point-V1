"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldAlert } from "lucide-react";
import { signOut, useSession, SessionProvider } from "next-auth/react";

function ChangePasswordForm() {
  const router = useRouter();
  const { update } = useSession();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

      // Success! Update the NextAuth session so the UI knows we don't need a password change anymore
      await update({ requiresPasswordChange: false });
      
      // Refresh Next.js server components to re-evaluate layout checks
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

export default function ChangePasswordPopup() {
  return (
    <SessionProvider>
      <ChangePasswordForm />
    </SessionProvider>
  );
}


