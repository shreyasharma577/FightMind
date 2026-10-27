import React from 'react';
import { X, Gamepad2, Shield, Zap, Flame, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-[#07090e]/95 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-black text-2xl tracking-wider text-slate-100 uppercase">
              ARCADE COMBAT MANUAL
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          {/* Controls Grid */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <span className="text-cyan-400 uppercase tracking-wider block mb-3 font-bold">
              CONTROLS (KEYBOARD & TOUCH)
            </span>
            <div className="grid grid-cols-2 gap-3 text-slate-300">
              <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded">
                <span>Move Left / Right</span>
                <span className="font-bold text-amber-400">A / D · ◄ / ►</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded">
                <span>Jump / Anti-Air</span>
                <span className="font-bold text-amber-400">W · ▲</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded">
                <span>Punch (Light Strike)</span>
                <span className="font-bold text-cyan-400">J · Z</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded">
                <span>Kick (Heavy Knockback)</span>
                <span className="font-bold text-rose-400">K · X</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded">
                <span>Special Move</span>
                <span className="font-bold text-purple-400">L · C</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded">
                <span>Block / Guard (5s Max)</span>
                <span className="font-bold text-blue-400">SPACE · SHIFT</span>
              </div>
            </div>
            <div className="text-[11px] text-amber-300/90 mt-2 font-mono">
              * Shield Durability: Holding block for more than 5 seconds continuously causes a GUARD BREAK, staggering you for opponent punish!
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              * On mobile or touch devices, an on-screen D-Pad and action buttons will appear automatically.
            </div>
          </div>

          {/* Core Mechanics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>ENERGY METERS</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Energy charges naturally over time and on successful blocks. Spend it to execute devastating specials.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>PROMPT-TO-POWER</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Every generated fighter receives unique passives and weaknesses derived from your natural words.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>ADAPTIVE AI</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                The opponent analyzes repeated player habits (like jump spam or turtle blocking) and counters them in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-5 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-sm tracking-wider uppercase rounded-lg cursor-pointer transition-colors"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
