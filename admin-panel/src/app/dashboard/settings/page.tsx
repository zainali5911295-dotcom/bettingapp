"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function SettingsPage() {
  const [commissionColor, setCommissionColor] = useState(2.5);
  const [commissionAviator, setCommissionAviator] = useState(1.8);
  const [referralLevels, setReferralLevels] = useState([
    { level: 1, percentage: 3 },
    { level: 2, percentage: 2 },
    { level: 3, percentage: 1 },
  ]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [jackpotAmount, setJackpotAmount] = useState(5000);
  const [toast, setToast] = useState<string | null>(null);

  const saveSettings = () => {
    setToast('Settings saved locally. Backend integration can be added next.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">
            Configure commission rates, referral rewards, maintenance mode, and jackpot parameters.
          </p>
        </div>

        {toast && (
          <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-100">
            {toast}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Commission Rates</h2>
            <p className="mt-2 text-sm text-slate-400">Set the house edge for each game.</p>
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-300">Color Prediction (%)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={commissionColor}
                onChange={(e) => setCommissionColor(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
              <label className="block text-sm text-slate-300">Aviator (%)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={commissionAviator}
                onChange={(e) => setCommissionAviator(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Maintenance & Jackpot</h2>
            <p className="mt-2 text-sm text-slate-400">Toggle maintenance mode and tune jackpot payouts.</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-950 px-4 py-4">
                <div>
                  <p className="text-white font-medium">Maintenance Mode</p>
                  <p className="text-slate-400 text-sm">Block user access while performing updates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode((value) => !value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${maintenanceMode ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'}`}
                >
                  {maintenanceMode ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <label className="block text-sm text-slate-300">Jackpot Target (USD)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={jackpotAmount}
                onChange={(e) => setJackpotAmount(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-lg shadow-black/20">
          <h2 className="text-xl font-semibold text-white">Referral Levels</h2>
          <p className="mt-2 text-sm text-slate-400">Manage tiered commission rewards for referrals.</p>
          <div className="mt-6 space-y-4">
            {referralLevels.map((level) => (
              <div key={level.level} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <span className="min-w-[88px] text-sm text-slate-300">Level {level.level}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={level.percentage}
                  onChange={(e) => {
                    const nextValue = Number(e.target.value);
                    setReferralLevels((current) =>
                      current.map((item) =>
                        item.level === level.level ? { ...item, percentage: nextValue } : item
                      )
                    );
                  }}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                />
                <span className="text-sm text-slate-400">%</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveSettings}
            className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-500 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
