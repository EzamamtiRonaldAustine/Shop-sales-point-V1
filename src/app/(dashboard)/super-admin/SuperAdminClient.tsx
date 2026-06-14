"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserX, RefreshCw, Shield, History, Clock } from "lucide-react";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF";
  deletedAt: string | null;
  createdAt: string;
  loginSessions: { loginAt: string; ipAddress: string | null }[];
};

type SessionData = {
  id: string;
  userId: string;
  loginAt: string;
  ipAddress: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
};

export default function SuperAdminClient({ currentUser }: { currentUser: { id: string, role: string } }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "sessions">("users");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "users") {
        const res = await fetch("/api/admin/users");
        if (res.ok) setUsers(await res.json());
      } else {
        const res = await fetch("/api/admin/sessions");
        if (res.ok) setSessions(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update role");
      }
    } catch (error) {
      alert("Error updating role");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? They can be restored within 30 days.")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, deletedAt: data.deletedAt } : u));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      alert("Error deleting user");
    }
  };

  const handleRestore = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/restore`, { method: "POST" });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, deletedAt: null } : u));
      } else {
        const err = await res.json();
        alert(err.message || "Failed to restore user");
      }
    } catch (error) {
      alert("Error restoring user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${activeTab === "users" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("users")}
        >
          <Shield className="mr-2 h-4 w-4" />
          User Management
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm flex items-center ${activeTab === "sessions" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("sessions")}
        >
          <History className="mr-2 h-4 w-4" />
          Login History
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading data...</div>
      ) : activeTab === "users" ? (
        <Card>
          <CardHeader>
            <CardTitle>All System Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Login</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const isSelf = u.id === currentUser.id;
                    const isDeleted = !!u.deletedAt;
                    
                    let daysUntilPurge = 0;
                    if (isDeleted) {
                      const deleteDate = new Date(u.deletedAt!);
                      const purgeDate = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                      const now = new Date();
                      daysUntilPurge = Math.max(0, Math.ceil((purgeDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
                    }

                    return (
                      <tr key={u.id} className={isDeleted ? "bg-red-50" : "hover:bg-gray-50"}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {u.name || "—"} {isSelf && <span className="text-xs text-blue-600 ml-2">(You)</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={isSelf || isDeleted}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-1"
                          >
                            <option value="STAFF">Staff</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {isDeleted ? (
                            <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                              Deleted (Purge in {daysUntilPurge}d)
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {u.loginSessions?.length > 0
                            ? new Date(u.loginSessions[0].loginAt).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!isSelf && (
                            isDeleted ? (
                              <button onClick={() => handleRestore(u.id)} className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center justify-end w-full">
                                <RefreshCw className="mr-1 h-3 w-3" /> Restore
                              </button>
                            ) : (
                              <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center justify-end w-full">
                                <UserX className="mr-1 h-3 w-3" /> Delete
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Login Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No login history found.</td></tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{s.user.name} <span className="text-gray-500 font-normal">({s.user.email})</span></td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {s.user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(s.loginAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.ipAddress || "Unknown"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
