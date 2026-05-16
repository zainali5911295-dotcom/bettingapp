"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface ColorRound {
  _id: string;
  roundNumber: number;
  winningColor: string | null;
  status: string;
}

export default function ColorPredictionGame() {
  const [currentRound, setCurrentRound] = useState<ColorRound | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [selectedColor, setSelectedColor] = useState<"Red" | "Green" | "Violet" | null>(null);
  const [loading, setLoading] = useState(true);
  const [betting, setBetting] = useState(false);

  const fetchCurrentRound = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/color-prediction/current");
      setCurrentRound(res.data.round);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async () => {
    if (!selectedColor || !currentRound || betAmount <= 0) {
      alert("Please select color and amount");
      return;
    }

    setBetting(true);
    try {
      // Yahan future mein real bet API call hoga
      alert(`✅ Bet Placed: ₹${betAmount} on ${selectedColor}`);
      setSelectedColor(null);
      setBetAmount(100);
    } catch (err) {
      alert("Bet failed");
    } finally {
      setBetting(false);
    }
  };

  useEffect(() => {
    fetchCurrentRound();
    const interval = setInterval(fetchCurrentRound, 5000); // Har 5 second mein update
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎨 Color Prediction</h1>
          <p className="text-slate-400">Predict the color and win big!</p>
        </div>

        {/* Current Round */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400">Round #{currentRound?.roundNumber}</p>
              <p className="text-3xl font-bold">
                {currentRound?.status === "open" ? "Betting Open" : "Waiting..."}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${currentRound?.status === "open" ? "bg-green-600" : "bg-yellow-600"}`}>
              {currentRound?.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Bet Amount */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-6">
          <p className="text-slate-400 mb-3">Bet Amount (₹)</p>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-3xl font-bold text-center"
          />
        </div>

        {/* Color Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setSelectedColor("Red")}
            className={`py-12 rounded-3xl text-2xl font-bold transition-all ${selectedColor === "Red" ? "bg-red-600 scale-105" : "bg-red-700 hover:bg-red-600"}`}
          >
            🔴 RED
          </button>
          <button
            onClick={() => setSelectedColor("Green")}
            className={`py-12 rounded-3xl text-2xl font-bold transition-all ${selectedColor === "Green" ? "bg-green-600 scale-105" : "bg-green-700 hover:bg-green-600"}`}
          >
            🟢 GREEN
          </button>
          <button
            onClick={() => setSelectedColor("Violet")}
            className={`py-12 rounded-3xl text-2xl font-bold transition-all ${selectedColor === "Violet" ? "bg-purple-600 scale-105" : "bg-purple-700 hover:bg-purple-600"}`}
          >
            🟣 VIOLET
          </button>
        </div>

        {/* Place Bet Button */}
        <button
          onClick={placeBet}
          disabled={!selectedColor || betting}
          className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-xl font-bold disabled:opacity-50"
        >
          {betting ? "Placing Bet..." : `PLACE BET ₹${betAmount} ON ${selectedColor || "???"}`}
        </button>

        <p className="text-center text-slate-500 text-sm mt-6">
          Minimum Bet: ₹10 | Maximum Bet: ₹50,000
        </p>
      </div>
    </div>
  );
}