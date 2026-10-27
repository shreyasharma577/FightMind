import React from 'react';
import { FighterDefinition, MatchTelemetry } from '../types/fighter';
import { FighterRenderer } from './FighterRenderer';
import { Trophy, RotateCcw, Sparkles, Edit3, ArrowLeft, Film } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface StatsModalProps {
  winner: 'p1' | 'cpu';
  p1Fighter: FighterDefinition;
  cpuFighter: FighterDefinition;
  telemetry: MatchTelemetry;
  onRematch: () => void;
  onWatchReplay?: () => void;
  onOpenEvolution: () => void;
  onEditInForge: () => void;
  onReturnToMenu: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  winner,
  p1Fighter,
  cpuFighter,
  telemetry,
  onRematch,
  onWatchReplay,
  onOpenEvolution,
  onEditInForge,
  onReturnToMenu
}) => {
  const isP1Winner = winner === 'p1';
  const winningFighter = isP1Winner ? p1Fighter : cpuFighter;

  return (
    <div className="absolute inset-0 bg-[#07090e]/95 backdrop-blur-md z-40 flex items-center justify-center p-4 md:p-8 select-none overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col justify-between my-auto">
        {/* BANNER */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>MATCH CONCLUSION</span>
          </div>

          <h2 className={`font-display font-black text-5xl md:text-6xl tracking-wider uppercase leading-none ${
            isP1Winner ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'text-rose-500'
          }`}>
            {isP1Winner ? 'VICTORY!' : 'DEFEAT'}
          </h2>

          <p className="text-sm font-mono text-slate-300 mt-2 italic">
            "{winningFighter.personality.victoryDialogue}"
          </p>
        </div>

        {/* WINNER SHOWCASE & TELEMETRY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
          {/* Winner Portrait */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-2xl border border-slate-700 bg-slate-950/80 flex items-center justify-center overflow-hidden shadow-inner">
              <div className="scale-110 transform translate-y-4">
                <FighterRenderer fighter={winningFighter} scale={1.2} isAnimated={true} />
              </div>
            </div>
            <div className="font-display font-black text-xl text-slate-100 uppercase tracking-wide mt-2">
              {winningFighter.name}
            </div>
            <div className="text-xs font-mono text-cyan-300 italic">{winningFighter.title}</div>
          </div>

          {/* Telemetry Stats */}
          <div className="md:col-span-7 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
              COMBAT TELEMETRY
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DAMAGE DEALT</span>
                <span className="font-bold text-cyan-400 text-sm">{Math.round(telemetry.playerDamageDealt)}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DAMAGE RECEIVED</span>
                <span className="font-bold text-rose-400 text-sm">{Math.round(telemetry.opponentDamageDealt)}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MAX COMBO</span>
                <span className="font-bold text-amber-400 text-sm">{telemetry.playerCombosMax} HITS</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SUCCESSFUL BLOCKS</span>
                <span className="font-bold text-slate-200 text-sm">{telemetry.playerBlocks}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SPECIALS EXECUTED</span>
                <span className="font-bold text-purple-400 text-sm">{telemetry.playerSpecialsUsed}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MATCH DURATION</span>
                <span className="font-bold text-slate-200 text-sm">{Math.round(telemetry.matchDurationSeconds)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              onRematch();
            }}
            className="py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REMATCH</span>
          </button>

          {onWatchReplay && (
            <button
              onClick={() => {
                soundManager.playClick();
                onWatchReplay();
              }}
              className="py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-400 text-white font-display font-black text-sm uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all animate-pulse"
            >
              <Film className="w-4 h-4" />
              <span>REPLAY</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenEvolution();
            }}
            className="py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>EVOLVE</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onEditInForge();
            }}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs uppercase border border-cyan-800/60 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>FORGE</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToMenu();
            }}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase border border-slate-700 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors col-span-2 sm:col-span-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
