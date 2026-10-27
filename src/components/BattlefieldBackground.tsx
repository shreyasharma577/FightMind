import React, { useMemo } from 'react';
import { ArenaDefinition } from '../data/arenas';
import { ARENA_WIDTH, ARENA_HEIGHT, GROUND_Y } from '../game/engine/CombatEngine';

interface BattlefieldBackgroundProps {
  arena: ArenaDefinition;
  screenShake: number;
}

export const BattlefieldBackground: React.FC<BattlefieldBackgroundProps> = ({
  arena,
  screenShake
}) => {
  const theme = arena.theme;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* 1. SKY GRADIENT BACKDROP */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${arena.skyGradient[0]} 0%, ${arena.skyGradient[1]} 70%, #030712 100%)`
        }}
      />

      {/* 2. THEME-SPECIFIC HIGH-AESTHETIC BATTLEFIELD ART */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${ARENA_WIDTH} ${ARENA_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Radial Glow Filters */}
          <radialGradient id={`skyGlow_${theme}`} cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor={arena.accentGlow} stopOpacity="0.28" />
            <stop offset="60%" stopColor={arena.accentGlow} stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`groundGrad_${theme}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={arena.groundColor} />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Sky Dome Glow */}
        <rect x="0" y="0" width={ARENA_WIDTH} height={ARENA_HEIGHT} fill={`url(#skyGlow_${theme})`} />

        {/* -------------------- THEME: CYBERPUNK NEO SHINJUKU -------------------- */}
        {theme === 'cyberpunk' && (
          <g>
            {/* Distant skyline silhouettes */}
            <g fill="#070c18" opacity="0.85">
              <rect x="30" y="100" width="70" height="400" />
              <polygon points="30,100 65,60 100,100" />
              <rect x="120" y="140" width="90" height="360" />
              <rect x="230" y="80" width="110" height="420" />
              <rect x="360" y="130" width="85" height="370" />
              <rect x="465" y="50" width="130" height="450" />
              <polygon points="465,50 530,15 595,50" />
              <rect x="615" y="110" width="95" height="390" />
              <rect x="730" y="70" width="115" height="430" />
              <rect x="865" y="125" width="80" height="375" />
            </g>

            {/* Glowing Window Matrices */}
            <g fill="#38bdf8" opacity="0.25">
              {[...Array(14)].map((_, i) => (
                <rect key={`w1_${i}`} x={485 + (i % 3) * 35} y={120 + Math.floor(i / 3) * 55} width="16" height="24" rx="2" />
              ))}
              {[...Array(10)].map((_, i) => (
                <rect key={`w2_${i}`} x={250 + (i % 2) * 45} y={150 + Math.floor(i / 2) * 50} width="18" height="20" fill="#f43f5e" rx="2" />
              ))}
              {[...Array(12)].map((_, i) => (
                <rect key={`w3_${i}`} x={755 + (i % 2) * 45} y={140 + Math.floor(i / 2) * 45} width="16" height="18" fill="#fbbf24" rx="2" />
              ))}
            </g>

            {/* Antenna Spire Red Beacons */}
            <circle cx="65" cy="58" r="3" fill="#ef4444" className="animate-pulse" filter="url(#neonBlur)" />
            <circle cx="530" cy="12" r="4" fill="#00f0ff" className="animate-pulse" filter="url(#neonBlur)" />
            <circle cx="788" cy="68" r="3" fill="#ef4444" className="animate-pulse" filter="url(#neonBlur)" />

            {/* Massive Mid-ground Holographic Billboards */}
            <g transform="translate(140, 180)">
              <rect x="0" y="0" width="90" height="42" fill="#030712" stroke="#f43f5e" strokeWidth="2" rx="4" opacity="0.9" />
              <text x="45" y="26" fill="#f43f5e" fontSize="13" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" textAnchor="middle" filter="url(#neonBlur)">
                電撃 // BATTLE
              </text>
            </g>

            <g transform="translate(710, 160)">
              <rect x="0" y="0" width="105" height="48" fill="#030712" stroke="#00f0ff" strokeWidth="2" rx="4" opacity="0.9" />
              <text x="52" y="30" fill="#00f0ff" fontSize="14" fontFamily="'Barlow Condensed', sans-serif" fontWeight="900" textAnchor="middle" filter="url(#neonBlur)">
                FIGHT//MIND
              </text>
            </g>

            {/* Flying Air-Traffic Speeders with Trails */}
            <path d="M -50 180 L 1050 240" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="40 180" opacity="0.45" />
            <path d="M 1050 130 L -50 160" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="50 220" opacity="0.45" />

            {/* Helipad Security Railings in Background */}
            <line x1="0" y1={GROUND_Y - 35} x2={ARENA_WIDTH} y2={GROUND_Y - 35} stroke="#334155" strokeWidth="3" />
            {[...Array(16)].map((_, i) => (
              <line key={`rail_${i}`} x1={i * 65} y1={GROUND_Y - 35} x2={i * 65} y2={GROUND_Y} stroke="#1e293b" strokeWidth="4" />
            ))}
          </g>
        )}

        {/* -------------------- THEME: SUB-ZERO REACTOR CORE -------------------- */}
        {theme === 'reactor' && (
          <g>
            {/* Massive Central Thermal Reactor Cylinder */}
            <g transform="translate(480, 260)">
              {/* Outer Core Glow */}
              <circle cx="0" cy="0" r="140" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.4" strokeDasharray="20 10" />
              <circle cx="0" cy="0" r="115" fill="#0f172a" stroke="#b91c1c" strokeWidth="8" />
              <circle cx="0" cy="0" r="85" fill="#450a0a" stroke="#f97316" strokeWidth="4" filter="url(#neonBlur)" className="animate-pulse" />
              <circle cx="0" cy="0" r="45" fill="#ef4444" opacity="0.8" />
              <circle cx="0" cy="0" r="20" fill="#ffffff" />

              {/* Stabilizer Magnetic Prongs */}
              <line x1="-150" y1="0" x2="-85" y2="0" stroke="#94a3b8" strokeWidth="8" />
              <line x1="85" y1="0" x2="150" y2="0" stroke="#94a3b8" strokeWidth="8" />
              <line x1="0" y1="-150" x2="0" y2="-85" stroke="#94a3b8" strokeWidth="8" />
              <line x1="0" y1="85" x2="0" y2="150" stroke="#94a3b8" strokeWidth="8" />
            </g>

            {/* Coolant Pipes & Conduits */}
            <path d="M 0 160 Q 240 280 340 260" fill="none" stroke="#475569" strokeWidth="12" />
            <path d="M 0 180 Q 240 300 340 280" fill="none" stroke="#0284c7" strokeWidth="6" opacity="0.7" />
            <path d="M 960 160 Q 720 280 620 260" fill="none" stroke="#475569" strokeWidth="12" />
            <path d="M 960 180 Q 720 300 620 280" fill="none" stroke="#f97316" strokeWidth="6" opacity="0.7" />

            {/* Industrial Catwalk & Warning Decals */}
            <rect x="0" y={GROUND_Y - 45} width={ARENA_WIDTH} height="20" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            {[...Array(20)].map((_, i) => (
              <polygon
                key={`warn_${i}`}
                points={`${i * 50},${GROUND_Y - 45} ${i * 50 + 20},${GROUND_Y - 45} ${i * 50 + 10},${GROUND_Y - 25} ${i * 50 - 10},${GROUND_Y - 25}`}
                fill="#f59e0b"
                opacity="0.35"
              />
            ))}
          </g>
        )}

        {/* -------------------- THEME: CELESTIAL SHRINE TEMPLE -------------------- */}
        {theme === 'temple' && (
          <g>
            {/* Giant Mystical Moon */}
            <circle cx="480" cy="150" r="95" fill="#f8fafc" opacity="0.9" />
            <circle cx="480" cy="150" r="115" fill="none" stroke="#c084fc" strokeWidth="4" opacity="0.4" filter="url(#neonBlur)" />

            {/* Aurora Borealis Curtain */}
            <path d="M 0 120 Q 240 40 480 110 T 960 60 L 960 260 L 0 260 Z" fill="#9333ea" opacity="0.12" filter="url(#neonBlur)" />
            <path d="M 0 80 Q 320 20 640 90 T 960 30 L 960 220 L 0 220 Z" fill="#38bdf8" opacity="0.10" filter="url(#neonBlur)" />

            {/* Distant Mountain Ridges */}
            <polygon points="0,450 180,240 360,450" fill="#0f172a" opacity="0.7" />
            <polygon points="260,450 500,200 740,450" fill="#1e1b4b" opacity="0.8" />
            <polygon points="620,450 820,250 960,450" fill="#0f172a" opacity="0.7" />

            {/* Sacred Torii Gates */}
            <g transform="translate(180, 290)">
              <rect x="0" y="0" width="12" height="120" fill="#b91c1c" />
              <rect x="68" y="0" width="12" height="120" fill="#b91c1c" />
              <rect x="-10" y="0" width="100" height="14" rx="2" fill="#991b1b" stroke="#f59e0b" strokeWidth="1" />
              <rect x="-4" y="22" width="88" height="10" fill="#991b1b" />
            </g>

            <g transform="translate(700, 290)">
              <rect x="0" y="0" width="12" height="120" fill="#b91c1c" />
              <rect x="68" y="0" width="12" height="120" fill="#b91c1c" />
              <rect x="-10" y="0" width="100" height="14" rx="2" fill="#991b1b" stroke="#f59e0b" strokeWidth="1" />
              <rect x="-4" y="22" width="88" height="10" fill="#991b1b" />
            </g>

            {/* Floating Spirit Pagodas / Lanterns with fireflies */}
            <circle cx="220" cy="330" r="4" fill="#a855f7" filter="url(#neonBlur)" className="animate-pulse" />
            <circle cx="740" cy="330" r="4" fill="#a855f7" filter="url(#neonBlur)" className="animate-pulse" />
          </g>
        )}

        {/* -------------------- THEME: APEX ORBITAL RING -------------------- */}
        {theme === 'orbital' && (
          <g>
            {/* Planetary Horizon Curve */}
            <circle cx="480" cy="980" r="750" fill="#090d16" stroke="#00f0ff" strokeWidth="3" opacity="0.85" />
            <path
              d="M 0 320 Q 480 260 960 320"
              stroke="#38bdf8"
              strokeWidth="5"
              fill="none"
              opacity="0.9"
              filter="url(#neonBlur)"
            />

            {/* City clusters on planet surface at night */}
            <g fill="#fef08a" opacity="0.6">
              {[...Array(24)].map((_, i) => (
                <circle key={`city_${i}`} cx={120 + i * 32} cy={340 + Math.sin(i * 0.8) * 15} r={Math.random() * 2 + 1} />
              ))}
            </g>

            {/* Giant Rotating Orbital Ring Station Truss */}
            <rect x="0" y="140" width={ARENA_WIDTH} height="18" fill="#1e293b" opacity="0.65" />
            <path d="M 0 149 L 960 149" stroke="#eab308" strokeWidth="2" strokeDasharray="15 15" opacity="0.8" />

            {/* Solar Collector Panels */}
            <g transform="translate(160, 90)">
              <rect x="0" y="0" width="70" height="35" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" rx="3" opacity="0.8" />
              <line x1="35" y1="0" x2="35" y2="35" stroke="#38bdf8" strokeWidth="1" />
              <line x1="0" y1="17" x2="70" y2="17" stroke="#38bdf8" strokeWidth="1" />
            </g>

            <g transform="translate(730, 90)">
              <rect x="0" y="0" width="70" height="35" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" rx="3" opacity="0.8" />
              <line x1="35" y1="0" x2="35" y2="35" stroke="#38bdf8" strokeWidth="1" />
              <line x1="0" y1="17" x2="70" y2="17" stroke="#38bdf8" strokeWidth="1" />
            </g>
          </g>
        )}

        {/* -------------------- ARENA PLATFORM GROUND LAYER -------------------- */}
        {/* Solid Stage Floor */}
        <rect
          x="0"
          y={GROUND_Y}
          width={ARENA_WIDTH}
          height={ARENA_HEIGHT - GROUND_Y}
          fill={`url(#groundGrad_${theme})`}
        />

        {/* High-Impact Neon Ground Edge Rim */}
        <line
          x1="0"
          y1={GROUND_Y}
          x2={ARENA_WIDTH}
          y2={GROUND_Y}
          stroke={arena.accentGlow}
          strokeWidth="3.5"
          filter="url(#neonBlur)"
        />

        {/* Floor Depth Grid Lines */}
        <g stroke={arena.accentGlow} strokeWidth="1.2" opacity="0.35">
          <line x1="0" y1={GROUND_Y + 15} x2={ARENA_WIDTH} y2={GROUND_Y + 15} />
          <line x1="0" y1={GROUND_Y + 40} x2={ARENA_WIDTH} y2={GROUND_Y + 40} strokeWidth="2" />
          <line x1="0" y1={GROUND_Y + 70} x2={ARENA_WIDTH} y2={GROUND_Y + 70} strokeWidth="2.5" />

          {/* Perspective grid verticals radiating outward */}
          {[...Array(19)].map((_, i) => {
            const topX = 60 + i * 46;
            const bottomX = (topX - ARENA_WIDTH / 2) * 1.35 + ARENA_WIDTH / 2;
            return (
              <line
                key={`vert_${i}`}
                x1={topX}
                y1={GROUND_Y}
                x2={bottomX}
                y2={ARENA_HEIGHT}
              />
            );
          })}
        </g>

        {/* Center Arena Combat Crest */}
        <g transform={`translate(${ARENA_WIDTH / 2}, ${GROUND_Y + 35})`}>
          <ellipse cx="0" cy="0" rx="140" ry="22" fill="none" stroke={arena.accentGlow} strokeWidth="2" opacity="0.45" />
          <ellipse cx="0" cy="0" rx="90" ry="14" fill="none" stroke={arena.accentGlow} strokeWidth="1.5" opacity="0.3" strokeDasharray="10 5" />
        </g>
      </svg>
    </div>
  );
};
