// client-side login page for DailySales app using Next.js, React Hook Form, and NextAuth for authentication. 
// The page includes form validation with Zod and displays error messages for invalid credentials or unexpected errors. It also provides a link to the registration page for new users.
"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

// Isolated component so useSearchParams() can be safely wrapped in Suspense
function TimeoutBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("timeout") === "true") {
      setShow(true);
      // Clean the ?timeout param from the URL without a full navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("timeout");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/30 p-4 border border-yellow-200 dark:border-yellow-700/50">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Session Expired</h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
            <p>You have been logged out due to inactivity for your security. Please log in again.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">DailySales</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Track your business easily.</p>
        </div>

        {/* Suspense boundary required by Next.js for useSearchParams() */}
        <Suspense fallback={null}>
          <TimeoutBanner />
        </Suspense>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Log in to your account</CardTitle>
            <CardDescription>Enter your email below to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email address"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                error={errors.email?.message}
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                {...register("password")}
                error={errors.password?.message}
                disabled={isLoading}
              />

              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-500 dark:text-red-400 font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Don&apos;t have an account? </span>
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
