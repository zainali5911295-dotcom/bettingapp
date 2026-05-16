"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import axios from "axios";

interface User {
  _id: string;
  email: string;
  username: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState(0);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users");
      const data = res.data.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Search Function
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  };

  // Open Balance Edit Modal
  const openBalanceModal = (user: User) => {
    setSelectedUser(user);
    setBalanceAmount(0);
    setShowBalanceModal(true);
  };

  // Update Balance
  const updateBalance = async () => {
    if (!selectedUser || balanceAmount === 0) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${selectedUser._id}/balance`,
        { amount: balanceAmount }
      );
      setShowBalanceModal(false);
      fetchUsers();
      alert("Balance updated successfully!");
    } catch (err) {
      alert("Failed to update balance");
    }
  };

  // Toggle Ban / Unban
  const toggleBan = async (user: User) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${user._id}/toggle-ban`);
      fetchUsers();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Users Management</h1>
          <p className="text-slate-400">Search users, edit balances, and ban or unban accounts</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by email or username"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 px-8 rounded-xl text-white font-semibold"
          >
            Search
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left p-4 text-slate-300">Email</th>
                <th className="text-left p-4 text-slate-300">Username</th>
                <th className="text-left p-4 text-slate-300">Balance</th>
                <th className="text-left p-4 text-slate-300">Status</th>
                <th className="text-left p-4 text-slate-300">Created</th>
                <th className="text-center p-4 text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t border-slate-700 hover:bg-slate-800">
                    <td className="p-4 text-white">{user.email}</td>
                    <td className="p-4 text-slate-300">{user.username || "-"}</td>
                    <td className="p-4 text-white font-medium">₹{user.balance || 0}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isActive ? "bg-green-600" : "bg-red-600"}`}>
                        {user.isActive ? "Active" : "Banned"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      <button
                        onClick={() => openBalanceModal(user)}
                        className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm"
                      >
                        Edit Balance
                      </button>
                      <button
                        onClick={() => toggleBan(user)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium ${user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        {user.isActive ? "Ban" : "Unban"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Balance Modal */}
        {showBalanceModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2">Edit Balance</h2>
              <p className="text-slate-400 mb-6">{selectedUser.email}</p>

              <div className="mb-6">
                <label className="text-sm text-slate-400">Current Balance</label>
                <div className="text-3xl font-bold text-white mt-1">₹{selectedUser.balance || 0}</div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Amount to Add / Subtract</label>
                <input
                  type="number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white mt-2"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(Number(e.target.value))}
                  placeholder="Enter amount (use negative to subtract)"
                />
                <p className="text-xs text-slate-500 mt-1">Use negative value to deduct balance</p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-600 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={updateBalance}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}