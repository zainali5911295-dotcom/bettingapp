"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getAdminWithdrawals, approveWithdrawal, rejectWithdrawal } from "@/lib/adminApi";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Withdrawal } from "@/lib/types";

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await getAdminWithdrawals({ status: 'pending', page: 1, limit: 50 });
      setWithdrawals(response.items || response.data || []);
    } catch (error) {
      console.error(error);
      setToast('Unable to load withdrawal requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApprove = async (id: string) => {
    const note = window.prompt('Add an optional approval note', 'Approved by admin');
    try {
      await approveWithdrawal(id, note || '');
      setToast('Withdrawal approved.');
      await loadWithdrawals();
    } catch (error) {
      console.error(error);
      setToast('Approval failed.');
    }
  };

  const handleReject = async (id: string) => {
    const note = window.prompt('Enter rejection reason', 'Insufficient verification');
    if (note === null) return;
    try {
      await rejectWithdrawal(id, note);
      setToast('Withdrawal rejected.');
      await loadWithdrawals();
    } catch (error) {
      console.error(error);
      setToast('Rejection failed.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Withdrawals</h1>
          <p className="text-slate-400 mt-1">
            Manage pending withdrawal requests, approve or reject with reason.
          </p>
        </div>

        {toast && (
          <div className="rounded-3xl border border-slate-600 bg-slate-900 p-4 text-sm text-slate-200">
            {toast}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-lg shadow-black/20">
          {loading ? (
            <LoadingSpinner />
          ) : withdrawals.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No pending withdrawals at the moment.</div>
          ) : (
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-950/90 text-slate-400">
                <tr>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Requested</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((item) => (
                  <tr key={item._id} className="border-b border-slate-800">
                    <td className="px-4 py-4 text-sm text-white">
                      {item.userId?.email || 'Unknown'}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-200">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-200">{item.status}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(item._id)}
                        className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(item._id)}
                        className="rounded-2xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
