"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  User as UserIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ProfileClientProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    profileImage?: string | null;
  } | null;
}

/**
 * StatusBanner Component
 * 
 * Reusable UI component to display success or error messages cleanly.
 * Automatically adapts colors based on the message type (success/error).
 */
function StatusBanner({
  message,
}: {
  message: { type: "success" | "error"; text: string } | null;
}) {
  if (!message) return null;
  const isSuccess = message.type === "success";
  return (
    <div
      className={`mt-5 p-4 rounded-md flex items-center gap-3 border text-sm font-medium ${
        isSuccess
          ? "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
          : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <p>{message.text}</p>
    </div>
  );
}

/**
 * PasswordInput Component
 * 
 * A specialized input field for passwords that includes a built-in visibility toggle.
 * Enhances UX by allowing users to verify the password they typed.
 */
function PasswordInput({
  id,
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder ?? "••••••••"}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 pr-10 text-sm shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

/**
 * ChangePasswordSection Component
 * 
 * An interactive, accordion-style component that allows users to change their password voluntarily.
 * It manages form state, handles client-side validation (matching passwords, minimum length),
 * visualizes password strength, and securely communicates with the backend API.
 */
function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match. Please try again." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message ?? "Password updated successfully." });
        reset();
        setOpen(false);
      } else {
        let errorMsg = data.message ?? "Failed to update password.";
        if (data.errors) {
          const fieldErrors = Object.values(data.errors).flat().join(" ");
          errorMsg = `${errorMsg} ${fieldErrors}`;
        }
        setMessage({ type: "error", text: errorMsg });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => {
          setOpen((p) => !p);
          if (open) reset();
        }}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Change Password
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Update your account password
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Accordion body */}
      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-w-md">
            <PasswordInput
              id="current-password"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              disabled={isSubmitting}
            />
            <PasswordInput
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              disabled={isSubmitting}
              placeholder="Min. 6 characters"
            />
            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={isSubmitting}
            />

            {/* Password strength hint */}
            {newPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    newPassword.length < 6
                      ? "bg-red-400"
                      : newPassword.length < 10
                      ? "bg-yellow-400"
                      : "bg-green-500"
                  }`}
                />
                <span>
                  {newPassword.length < 6
                    ? "Too short"
                    : newPassword.length < 10
                    ? "Fair"
                    : "Strong"}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                disabled={isSubmitting}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>

          <StatusBanner message={message} />
        </div>
      )}

      {/* Show persistent success message outside the accordion when it's closed */}
      {!open && message?.type === "success" && (
        <div className="px-6 pb-4">
          <StatusBanner message={message} />
        </div>
      )}
    </div>
  );
}

/**
 * ProfileClient Component
 * 
 * The main client-side orchestrator for the profile page.
 * It manages the user's avatar upload flow (including client-side image compression),
 * displays user details, and houses the ChangePasswordSection.
 * 
 * @param {Object} props.user - The currently authenticated user's details retrieved from the database.
 */
export default function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Show the newly uploaded image immediately, or fall back to the DB value
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const currentImage = previewImage || user?.profileImage || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarMessage({ type: "error", text: "Please select an image file (JPEG, PNG, etc)." });
      return;
    }

    setIsUploading(true);
    setAvatarMessage(null);

    try {
      const base64Image = await compressImage(file);

      const res = await fetch("/api/users/profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (res.ok) {
        setPreviewImage(base64Image);
        setAvatarMessage({ type: "success", text: "Profile picture updated successfully!" });
        router.refresh();
      } else {
        const data = await res.json();
        setAvatarMessage({ type: "error", text: data.message || "Failed to upload image." });
      }
    } catch {
      setAvatarMessage({ type: "error", text: "An error occurred while processing the image." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const MAX = 250;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) { height = (height * MAX) / width; width = MAX; }
          } else {
            if (height > MAX) { width = (width * MAX) / height; height = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Page heading ── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Profile Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account details, profile picture, and security settings.
        </p>
      </div>

      {/* ── Profile card ── */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border-4 border-white dark:border-gray-800 shadow flex items-center justify-center">
              {currentImage ? (
                <img src={currentImage} alt="Profile Picture" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 dark:bg-gray-800 dark:text-slate-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Change Picture
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
          </div>

          {/* User details */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                Name
              </label>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {user?.name || "Not provided"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                Email address
              </label>
              <p className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                Role
              </label>
              <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-sm font-medium text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/30">
                {user?.role || "STAFF"}
              </span>
            </div>
          </div>
        </div>

        <StatusBanner message={avatarMessage} />
      </div>

      {/* ── Change Password card ── */}
      <ChangePasswordSection />
    </div>
  );
}
