import React from 'react';
import { RotateCcw, Zap, Shield, Play } from 'lucide-react';

interface TrainingOverlayProps {
  onResetPositions: () => void;
  onRefillEnergy: () => void;
}

export const TrainingOverlay: React.FC<TrainingOverlayProps> = ({
  onResetPositions,
  onRefillEnergy
}) => {
  return (
    <div className="absolute top-24 left-6 pointer-events-auto z-20 flex flex-col gap-2">
      <div className="bg-slate-950/85 border border-cyan-800/60 rounded-lg p-2.5 shadow-lg backdrop-blur-sm text-xs font-mono">
        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-2">
          DOJO COMMANDS
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={onResetPositions}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-left text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Spacing</span>
          </button>
          <button
            onClick={onRefillEnergy}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-left text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Full Energy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
