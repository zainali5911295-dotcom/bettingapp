"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { AuthGuard } from "./AuthGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
