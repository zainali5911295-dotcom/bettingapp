// @ts-nocheck
import React from 'react';
import AviatorGame from '../Crash/AviatorGame';   // ← Yeh sahi path hai

export default function GamesPage() {
  return (
    <div className="p-6 bg-[#0a0e1a] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          🎮 Casino Games
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Aviator Game Card */}
          <div className="bg-[#1a2338] rounded-3xl p-6 border border-green-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">✈️</div>
              <div>
                <h2 className="text-3xl font-bold text-white">Aviator</h2>
                <p className="text-green-400">Crash Game • High Multiplier</p>
              </div>
            </div>
            
            <div className="bg-[#0f172a] rounded-2xl p-4">
              <AviatorGame />
            </div>
          </div>

          {/* Baaki Games (Placeholder) */}
          <div className="bg-[#1a2338] rounded-3xl p-6 border border-gray-700 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎰</div>
              <h3 className="text-2xl font-bold text-gray-400">More Games Coming Soon</h3>
              <p className="text-gray-500 mt-2">Crash, Teen Patti, Roulette, etc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}