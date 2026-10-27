import React, { useEffect, useState } from 'react';
import { FighterDefinition, MatchTelemetry } from '../types/fighter';
import { ShieldAlert, Crosshair, Lightbulb, RefreshCw, X } from 'lucide-react';

interface CoachModalProps {
  playerFighter: FighterDefinition;
  opponentFighter: FighterDefinition;
  telemetry?: MatchTelemetry;
  onClose: () => void;
}

export const CoachModal: React.FC<CoachModalProps> = ({
  playerFighter,
  opponentFighter,
  telemetry,
  onClose
}) => {
  const [adviceData, setAdviceData] = useState<{
    advice: string;
    keyWeakness: string;
    combatTips: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchAdvice() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/fighter-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerFighter,
            opponentFighter,
            telemetry: telemetry || {}
          })
        });
        const data = await res.json();
        if (isMounted) {
          setAdviceData(data);
        }
      } catch (err) {
        console.error('Failed to get coach advice:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchAdvice();
    return () => { isMounted = false; };
  }, [playerFighter, opponentFighter, telemetry]);

  return (
    <div className="absolute inset-0 bg-[#07090e]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 select-none overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-cyan-800/60 rounded-2xl p-6 md:p-8 shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-black text-2xl tracking-wider text-cyan-300 uppercase">
              CORNER TACTICAL COACH
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-cyan-300">ANALYZING COMBAT MATCHUP (GEMMA)...</span>
          </div>
        ) : adviceData ? (
          <div className="space-y-4">
            {/* Coach Takeaway */}
            <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                TACTICAL TAKEAWAY
              </span>
              <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                {adviceData.advice}
              </p>
            </div>

            {/* Opponent Weakness Exploit */}
            <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400 uppercase tracking-wider mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>EXPLOIT {opponentFighter.name.toUpperCase()}'S WEAKNESS</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed font-mono">
                {adviceData.keyWeakness}
              </p>
            </div>

            {/* Combat Tips */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase tracking-wider mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>MATCH STRATEGY</span>
              </div>
              <ul className="space-y-2">
                {adviceData.combatTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="pt-5 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-bold text-sm tracking-wider uppercase rounded-lg cursor-pointer transition-colors"
          >
            RETURN TO FIGHT
          </button>
        </div>
      </div>
    </div>
  );
};
