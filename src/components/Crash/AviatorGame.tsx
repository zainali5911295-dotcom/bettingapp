// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

export default function AviatorGame() {
  const [multiplier, setMultiplier] = useState(1.0);
  const [balance] = useState(4635);
  const planeRef = useRef(null);

  useEffect(() => {
    let progress = 20;
    const interval = setInterval(() => {
      progress += 1.45;
      if (progress > 98) progress = 20;

      const x = 40 + (progress * 3.0);
      const y = 145 - (progress * 1.18);

      if (planeRef.current) {
        planeRef.current.style.left = `${x}px`;
        planeRef.current.style.top = `${y}px`;
      }

      setMultiplier(1.0 + (progress / 26));
    }, 75);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: 'white', padding: '10px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '32px' }}>✈️</span>
          <span style={{ fontSize: '26px', fontWeight: 'bold' }}>AVIATOR</span>
        </div>
        <div style={{ background: '#1a2338', padding: '8px 16px', borderRadius: '999px', color: '#facc15', fontWeight: 'bold' }}>
          ${balance}
        </div>
      </div>

      {/* History */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px' }}>
        {[15.2, 11.5, 21.03, 16.62, 11.5, 14.6, 13.49, 40.1].map((val, i) => (
          <div key={i} style={{ padding: '6px 12px', background: '#166534', color: '#86efac', borderRadius: '999px', fontSize: '14px', fontWeight: 'bold' }}>
            {val}x
          </div>
        ))}
      </div>

      {/* Game Area */}
      <div style={{ position: 'relative', height: '300px', background: '#111827', borderRadius: '20px', overflow: 'hidden', border: '3px solid #22c55e' }}>
        
        {/* Green Curve Line */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%' }} viewBox="0 0 400 200">
          <path d="M 30 170 Q 130 135 220 95 Q 300 60 380 48" fill="none" stroke="#22c55e" strokeWidth="8" strokeOpacity="0.9" />
        </svg>

        {/* Plane PNG */}
        <img 
          ref={planeRef}
          src="/assets/plane.png"
          alt="plane"
          style={{ 
            position: 'absolute', 
            width: '55px', 
            transition: 'all 0.07s linear',
            left: '70px',
            top: '130px',
            filter: 'drop-shadow(0 0 15px #22c55e)'
          }}
        />

        {/* Multiplier */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '78px', fontWeight: 'bold', color: '#22c55e', textShadow: '0 0 25px #22c55e' }}>
            {multiplier.toFixed(2)}x
          </div>
          <div style={{ color: '#86efac', fontSize: '20px' }}>
            🚀 Flying...
          </div>
        </div>
      </div>

      {/* Bet Panel */}
      <div style={{ background: '#1a2338', borderRadius: '20px', padding: '20px', marginTop: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          {[20, 50, 100, 500].map((amt) => (
            <button key={amt} style={{ flex: 1, padding: '14px', background: '#0f172a', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}>
              ${amt}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ flex: 1, padding: '18px', background: '#22c55e', color: 'black', borderRadius: '16px', fontWeight: 'bold' }}>
            PLACE BET
          </button>
          <button style={{ flex: 1, padding: '18px', background: '#ef4444', color: 'white', borderRadius: '16px', fontWeight: 'bold' }}>
            CASH OUT
          </button>
        </div>
      </div>
    </div>
  );
}