"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { getAdminTransactions } from "@/lib/adminApi";
import { AdminTransaction } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await getAdminTransactions({
        page: 1,
        limit: 50,
        type: typeFilter,
        user: userFilter,
        after: fromDate || undefined,
        before: toDate || undefined,
      });
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      setToast('Unable to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleFilter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadTransactions();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 mt-1">
            Filter by date, type, and user to audit deposits and bets.
          </p>
        </div>

        {toast && (
          <div className="rounded-3xl border border-slate-600 bg-slate-900 p-4 text-sm text-slate-200">
            {toast}
          </div>
        )}

        <form onSubmit={handleFilter} className="grid gap-4 lg:grid-cols-4">
          <input
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            placeholder="Search user"
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          >
            <option value="">All types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="WITHDRAWAL_APPROVED">Withdrawal Approved</option>
            <option value="WITHDRAWAL_REJECTED">Withdrawal Rejected</option>
            <option value="BET_COLOR">Bet Color</option>
            <option value="WIN_COLOR">Win Color</option>
            <option value="BET_AVIATOR">Bet Aviator</option>
            <option value="WIN_AVIATOR">Win Aviator</option>
            <option value="REFERRAL_COMMISSION">Referral</option>
            <option value="ADMIN_ADJUSTMENT">Admin Edit</option>
          </select>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
          />
          <button
            type="submit"
            className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition"
          >
            Apply Filters
          </button>
        </form>

        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-lg shadow-black/20">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-950/90 text-slate-400">
                <tr>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Balance After</th>
                  <th className="px-4 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="border-b border-slate-800">
                      <td className="px-4 py-4 text-sm text-white">{tx.userEmail}</td>
                      <td className="px-4 py-4 text-sm text-slate-300">{tx.type}</td>
                      <td className="px-4 py-4 text-sm text-slate-200">{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-4 text-sm text-slate-200">{formatCurrency(tx.balanceAfter)}</td>
                      <td className="px-4 py-4 text-sm text-slate-400">{formatDateTime(tx.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
