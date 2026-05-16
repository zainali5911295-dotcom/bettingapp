"use client";

import React, { useState, useEffect } from 'react';

export default function AviatorGame() {
  const [multiplier, setMultiplier] = useState(1.00);
  const [isFlying, setIsFlying] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [balance, setBalance] = useState(12480);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [history, setHistory] = useState<Array<{mult: number, win: number}>>([]);

  const quickAmounts = [50, 100, 250, 500, 1000];

  const startRound = () => {
    if (betAmount > balance) {
      alert("Balance kam hai!");
      return;
    }

    setIsFlying(true);
    setHasCashedOut(false);
    setMultiplier(1.00);

    const crashPoint = Math.random() * 15 + 1.3; // 1.3x se 16x tak

    let currentMult = 1.0;
    const interval = setInterval(() => {
      currentMult += (Math.random() * 0.12) + 0.04;
      setMultiplier(Math.round(currentMult * 100) / 100);

      if (currentMult >= crashPoint) {
        clearInterval(interval);
        setIsFlying(false);
        
        if (!hasCashedOut) {
          setBalance(prev => Math.max(0, prev - betAmount));
          setHistory(prev => [{ mult: parseFloat(crashPoint.toFixed(2)), win: 0 }, ...prev].slice(0, 10));
        }
      }
    }, 70);
  };

  const cashOut = () => {
    if (!isFlying || hasCashedOut) return;

    const win = Math.floor(betAmount * multiplier);
    setBalance(prev => prev + win);
    setHasCashedOut(true);
    setIsFlying(false);

    setHistory(prev => [{ mult: parseFloat(multiplier.toFixed(2)), win }, ...prev].slice(0, 10));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-8 tracking-widest text-yellow-400">AVIATOR</h1>

        {/* Multiplier */}
        <div className="bg-slate-900 border-2 border-yellow-500/30 rounded-3xl p-10 text-center mb-8">
          <div className="text-8xl font-mono font-bold text-yellow-400 mb-2">
            {multiplier.toFixed(2)}x
          </div>
          <p className="text-slate-400 text-xl">MULTIPLIER</p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Bet Panel */}
          <div className="md:col-span-4 bg-slate-900 rounded-3xl p-6 border border-slate-700">
            <h3 className="text-xl mb-4">Place Your Bet</h3>
            
            <input 
              type="number" 
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-slate-800 text-3xl text-center py-4 rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <div className="grid grid-cols-5 gap-2 mb-6">
              {quickAmounts.map((amt) => (
                <button key={amt} onClick={() => setBetAmount(amt)}
                  className="bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-sm font-medium">
                  {amt}
                </button>
              ))}
            </div>

            {!isFlying ? (
              <button onClick={startRound}
                className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-2xl text-xl font-bold">
                START GAME
              </button>
            ) : (
              <button onClick={cashOut}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-5 rounded-2xl text-xl font-bold">
                CASH OUT ₹{(betAmount * multiplier).toFixed(0)}
              </button>
            )}
          </div>

          {/* Plane Area */}
          <div className="md:col-span-5 bg-slate-900 rounded-3xl p-8 flex items-center justify-center relative h-[380px] border border-slate-700 overflow-hidden">
            <div className={`text-[180px] transition-all duration-[8000ms] ${isFlying ? 'translate-x-[300px] -rotate-12' : ''}`}>
              ✈️
            </div>
            {isFlying && <div className="absolute top-8 text-yellow-400 text-2xl animate-pulse">FLYING...</div>}
          </div>

          {/* Balance & History */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700">
              <p className="text-slate-400">BALANCE</p>
              <p className="text-4xl font-bold text-green-400">₹{balance}</p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700">
              <h4 className="font-semibold mb-4">Recent Crashes</h4>
              {history.length === 0 ? (
                <p className="text-slate-500">No rounds yet</p>
              ) : (
                history.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-700 last:border-none">
                    <span>{item.mult}x</span>
                    <span className={item.win > 0 ? "text-green-400" : "text-red-500"}>
                      {item.win > 0 ? `+₹${item.win}` : "CRASH"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}