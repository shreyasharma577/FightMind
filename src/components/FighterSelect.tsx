import React, { useState } from 'react';
import { FighterDefinition } from '../types/fighter';
import { ArenaDefinition, ARENAS } from '../data/arenas';
import { getAllFighters, deleteCustomFighter } from '../data/fighters';
import { FighterRenderer } from './FighterRenderer';
import { Swords, UserPlus, Trash2, ArrowLeft, Shield, Zap, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface FighterSelectProps {
  onStartMatch: (p1: FighterDefinition, cpu: FighterDefinition, arena: ArenaDefinition) => void;
  onOpenForge: (fighterToEdit?: FighterDefinition) => void;
  onBackToMenu: () => void;
}

export const FighterSelect: React.FC<FighterSelectProps> = ({
  onStartMatch,
  onOpenForge,
  onBackToMenu
}) => {
  const [fighters, setFighters] = useState<FighterDefinition[]>(getAllFighters());
  const [selectedP1Index, setSelectedP1Index] = useState(0);
  const [selectedCpuIndex, setSelectedCpuIndex] = useState(fighters.length > 1 ? 1 : 0);
  const [selectedArenaIndex, setSelectedArenaIndex] = useState(0);

  const [selectingFor, setSelectingFor] = useState<'p1' | 'cpu'>('p1');

  const p1Fighter = fighters[selectedP1Index] || fighters[0];
  const cpuFighter = fighters[selectedCpuIndex] || fighters[1] || fighters[0];
  const activeArena = ARENAS[selectedArenaIndex] || ARENAS[0];

  const handleSelectFighter = (idx: number) => {
    soundManager.playClick();
    if (selectingFor === 'p1') {
      setSelectedP1Index(idx);
    } else {
      setSelectedCpuIndex(idx);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this custom fighter?')) {
      deleteCustomFighter(id);
      const updated = getAllFighters();
      setFighters(updated);
      setSelectedP1Index(0);
      setSelectedCpuIndex(updated.length > 1 ? 1 : 0);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] text-slate-100 select-none overflow-y-auto">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
        <button
          onClick={onBackToMenu}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO TITLE</span>
        </button>

        <h1 className="font-display font-black text-2xl tracking-wider text-cyan-400 uppercase">
          CHOOSE YOUR CONTENDER
        </h1>

        <button
          onClick={() => onOpenForge()}
          className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>NEW FIGHTER (FORGE)</span>
        </button>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* LEFT COLUMN: P1 CARD */}
        <div className="lg:col-span-3 p-5 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between bg-gradient-to-b from-cyan-950/20 to-slate-950/80">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
                PLAYER 1 (YOU)
              </span>
              <button
                onClick={() => setSelectingFor('p1')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer ${
                  selectingFor === 'p1' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                SELECTING
              </button>
            </div>

            <h2 className="font-display font-black text-3xl text-slate-100 uppercase tracking-wide">
              {p1Fighter.name}
            </h2>
            <p className="text-xs text-cyan-300 font-mono italic">{p1Fighter.title}</p>

            {/* Fighter Stage */}
            <div className="relative w-full aspect-square max-h-[220px] rounded-lg border border-slate-800 bg-slate-950/90 flex items-center justify-center my-3 overflow-hidden shadow-inner">
              <div className="scale-110 transform translate-y-4">
                <FighterRenderer fighter={p1Fighter} scale={1.15} isAnimated={true} />
              </div>
            </div>

            {/* Stats Overview */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>HEALTH</span>
                <span className="text-slate-200 font-bold">{p1Fighter.stats.maxHealth} HP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SPEED</span>
                <span className="text-cyan-300 font-bold">{p1Fighter.stats.speed}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>POWER</span>
                <span className="text-amber-400 font-bold">x{p1Fighter.stats.power}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SPECIAL</span>
                <span className="text-rose-400 font-bold truncate max-w-[140px]">{p1Fighter.specialMove.name}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono italic text-slate-400 border-t border-slate-800/80 pt-3 mt-3">
            "{p1Fighter.personality.introDialogue}"
          </p>
        </div>

        {/* CENTER COLUMN: ROSTER GRID & ARENA SELECT */}
        <div className="lg:col-span-6 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                AVAILABLE FIGHTERS ({fighters.length})
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Pick for:</span>
                <button
                  onClick={() => setSelectingFor('p1')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${selectingFor === 'p1' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  P1
                </button>
                <button
                  onClick={() => setSelectingFor('cpu')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${selectingFor === 'cpu' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  CPU
                </button>
              </div>
            </div>

            {/* ROSTER GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {fighters.map((f, idx) => {
                const isSelectedP1 = selectedP1Index === idx;
                const isSelectedCpu = selectedCpuIndex === idx;

                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelectFighter(idx)}
                    className={`relative p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelectedP1
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : isSelectedCpu
                        ? 'border-rose-400 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Tags */}
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      {f.isCustom ? (
                        <span className="text-amber-400 uppercase font-bold">CUSTOM</span>
                      ) : (
                        <span className="text-slate-500 uppercase">PRESET</span>
                      )}

                      {f.isCustom && (
                        <button
                          onClick={(e) => handleDelete(f.id, e)}
                          className="text-slate-600 hover:text-rose-400 p-0.5 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="h-16 flex items-center justify-center my-1 overflow-hidden pointer-events-none">
                      <div className="scale-75">
                        <FighterRenderer fighter={f} scale={0.7} isAnimated={false} />
                      </div>
                    </div>

                    <div className="font-display font-black text-sm uppercase text-slate-100 truncate">
                      {f.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 capitalize truncate">
                      {f.combatStyle} style
                    </div>

                    {/* Badge flags */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {isSelectedP1 && (
                        <span className="bg-cyan-500 text-slate-950 font-black font-mono text-[9px] px-1 rounded">
                          P1
                        </span>
                      )}
                      {isSelectedCpu && (
                        <span className="bg-rose-500 text-slate-950 font-black font-mono text-[9px] px-1 rounded">
                          CPU
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ARENA SELECTOR */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                BATTLEGROUND ARENA
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ARENAS.map((ar, idx) => (
                  <button
                    key={ar.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedArenaIndex(idx);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedArenaIndex === idx
                        ? 'border-amber-400 bg-amber-950/30'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-display font-bold text-xs uppercase block text-slate-200 truncate">
                      {ar.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 capitalize block">
                      {ar.theme}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* START FIGHT BUTTON */}
          <div className="pt-6">
            <button
              onClick={() => {
                soundManager.playRoundAnnounce();
                onStartMatch(p1Fighter, cpuFighter, activeArena);
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-display font-black text-2xl tracking-widest rounded-xl uppercase flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_30px_rgba(249,115,22,0.4)] active:scale-98 transition-all"
            >
              <Swords className="w-6 h-6 fill-slate-950" />
              <span>ENGAGE IN BATTLE</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CPU OPPONENT CARD */}
        <div className="lg:col-span-3 p-5 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between bg-gradient-to-b from-rose-950/20 to-slate-950/80">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">
                CPU OPPONENT
              </span>
              <button
                onClick={() => setSelectingFor('cpu')}
                className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer ${
                  selectingFor === 'cpu' ? 'bg-rose-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                SELECTING
              </button>
            </div>

            <h2 className="font-display font-black text-3xl text-slate-100 uppercase tracking-wide">
              {cpuFighter.name}
            </h2>
            <p className="text-xs text-rose-300 font-mono italic">{cpuFighter.title}</p>

            {/* Fighter Stage */}
            <div className="relative w-full aspect-square max-h-[220px] rounded-lg border border-slate-800 bg-slate-950/90 flex items-center justify-center my-3 overflow-hidden shadow-inner">
              <div className="scale-110 transform translate-y-4">
                <FighterRenderer fighter={cpuFighter} scale={1.15} facing={-1} isAnimated={true} />
              </div>
            </div>

            {/* Stats Overview */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>HEALTH</span>
                <span className="text-slate-200 font-bold">{cpuFighter.stats.maxHealth} HP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SPEED</span>
                <span className="text-cyan-300 font-bold">{cpuFighter.stats.speed}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>POWER</span>
                <span className="text-amber-400 font-bold">x{cpuFighter.stats.power}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SPECIAL</span>
                <span className="text-rose-400 font-bold truncate max-w-[140px]">{cpuFighter.specialMove.name}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] font-mono italic text-slate-400 border-t border-slate-800/80 pt-3 mt-3">
            "{cpuFighter.personality.introDialogue}"
          </p>
        </div>
      </div>
    </div>
  );
};
