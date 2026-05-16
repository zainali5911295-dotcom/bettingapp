"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Users, TrendingUp, BarChart3, Activity, Clock3 } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const stats = {
    totalUsers: 1248,
    totalBalance: 4567800,
    todaysProfit: 124500,
    activeGames: 4,
    pendingWithdrawals: 23,
    revenueByDay: [
      { date: "Mon", value: 45200 },
      { date: "Tue", value: 68100 },
      { date: "Wed", value: 52300 },
      { date: "Thu", value: 78900 },
      { date: "Fri", value: 94500 },
      { date: "Sat", value: 112300 },
      { date: "Sun", value: 98700 },
    ]
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-2">Real-time Betting Overview</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <Users className="w-10 h-10 text-purple-500" />
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-slate-400">Total Users</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-10 h-10 text-green-500" />
                  <div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalBalance)}</p>
                    <p className="text-slate-400">Total Balance</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <BarChart3 className="w-10 h-10 text-pink-500" />
                  <div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(stats.todaysProfit)}</p>
                    <p className="text-slate-400">Today's Revenue</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <Activity className="w-10 h-10 text-yellow-500" />
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.activeGames}</p>
                    <p className="text-slate-400">Active Games</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <Clock3 className="w-10 h-10 text-orange-500" />
                  <div>
                    <p className="text-3xl font-bold text-white">{stats.pendingWithdrawals}</p>
                    <p className="text-slate-400">Pending WD</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6">
              <h2 className="text-2xl font-semibold mb-6 text-white">Revenue Trend (Last 7 Days)</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.revenueByDay}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AVIATOR GAME BUTTON */}
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">🚀 Aviator Crash Game</h2>
                  <p className="text-slate-400 mt-2">Your live Aviator game is running</p>
                </div>
                
                <a 
                  href="http://localhost:4002" 
                  target="_blank"
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all whitespace-nowrap"
                >
                  Launch Aviator Game
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}