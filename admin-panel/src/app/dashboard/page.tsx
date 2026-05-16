"use client";

import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-4xl font-bold text-white mb-6">🎮 Aviator Crash Game</h1>
        
        <div 
          className="bg-black rounded-3xl overflow-hidden border-4 border-purple-600 shadow-2xl"
          style={{ height: "88vh" }}
        >
          <iframe 
            src="http://localhost:4002" 
            className="w-full h-full border-0"
            title="Aviator Game"
            allowFullScreen
          />
        </div>

        <div className="mt-4 text-center text-slate-400">
          Game ko alag tab mein chala rakho → <strong>http://localhost:4002</strong>
        </div>
      </div>
    </DashboardLayout>
  );
}