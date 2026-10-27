import React from 'react';
import { CombatFighterState, FighterDefinition } from '../types/fighter';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
  p1State: CombatFighterState;
  cpuState: CombatFighterState;
  roundTimer: number;
  currentRound: number;
  roundState: 'intro' | 'fight' | 'round_over' | 'match_over';
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenCoach: () => void;
  trainingMode?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  p1State,
  cpuState,
  roundTimer,
  currentRound,
  roundState,
  isPaused,
  onTogglePause,
  onOpenCoach,
  trainingMode = false
}) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  const p1HpPercent = Math.max(0, Math.min(100, (p1State.currentHealth / p1State.definition.stats.maxHealth) * 100));
  const cpuHpPercent = Math.max(0, Math.min(100, (cpuState.currentHealth / cpuState.definition.stats.maxHealth) * 100));

  const p1EnergyPercent = Math.max(0, Math.min(100, p1State.currentEnergy));
  const cpuEnergyPercent = Math.max(0, Math.min(100, cpuState.currentEnergy));

  const p1CanSpecial = p1State.currentEnergy >= p1State.definition.specialMove.energyCost && p1State.specialCooldown <= 0;
  const cpuCanSpecial = cpuState.currentEnergy >= cpuState.definition.specialMove.energyCost && cpuState.specialCooldown <= 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 md:p-6 overflow-hidden">
      {/* TOP PERIMETER: FIGHTER STATUS CLUSTERS & TIMER */}
      <div className="w-full max-w-5xl mx-auto flex items-start justify-between gap-3 md:gap-6">
        {/* PLAYER 1 CLUSTER */}
        <div className="flex-1 flex flex-col items-start min-w-0">
          {/* Header info */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display font-black text-lg md:text-2xl tracking-wider text-cyan-400 uppercase drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)]">
              {p1State.definition.name}
            </span>
            <span className="text-[10px] md:text-xs font-mono text-cyan-200/60 uppercase hidden sm:inline">
              P1
            </span>
            {/* Rounds Won */}
            <div className="flex items-center gap-1 ml-2">
              {[0, 1].map((rIdx) => (
                <div
                  key={rIdx}
                  className={`w-3 h-3 rounded-full border border-cyan-400/80 transition-all ${
                    p1State.roundsWon > rIdx ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'bg-slate-900/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Health Bar */}
          <div className="w-full h-5 md:h-7 bg-slate-950/80 border border-cyan-500/40 rounded-sm overflow-hidden p-0.5 shadow-[0_0_12px_rgba(0,0,0,0.8)]">
            <div
              className={`h-full transition-all duration-150 ease-out ${
                p1HpPercent < 30
                  ? 'bg-gradient-to-r from-red-600 to-rose-400 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-teal-300'
              }`}
              style={{ width: `${p1HpPercent}%` }}
            />
          </div>

          {/* HP Numbers & Energy */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-300 mt-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-300">{Math.ceil(p1State.currentHealth)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{p1State.definition.stats.maxHealth}</span>
            </div>
            {p1State.passiveTriggered && (
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider animate-bounce">
                {p1State.definition.passiveAbility.name} ACTIVE!
              </span>
            )}
          </div>

          {/* Energy Gauge */}
          <div className="w-4/5 h-2 bg-slate-950/80 border border-slate-700 rounded-sm overflow-hidden mt-1 p-px">
            <div
              className={`h-full transition-all duration-100 ${
                p1CanSpecial
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 animate-pulse shadow-[0_0_8px_#f59e0b]'
                  : 'bg-gradient-to-r from-blue-700 to-cyan-500'
              }`}
              style={{ width: `${p1EnergyPercent}%` }}
            />
          </div>

          {/* Shield Durability Gauge (5s Max Duration) */}
          {p1State.isBlocking && (
            <div className="w-4/5 mt-1 flex flex-col gap-0.5">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold">
                <span className={5.0 - p1State.blockDuration <= 1.5 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}>
                  SHIELD DURATION: {(Math.max(0, 5.0 - p1State.blockDuration)).toFixed(1)}s
                </span>
                <span className="text-slate-500">MAX 5.0s</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 border border-cyan-800 rounded-sm overflow-hidden p-px">
                <div
                  className={`h-full transition-all duration-75 ${
                    5.0 - p1State.blockDuration <= 1.5
                      ? 'bg-red-500 animate-pulse'
                      : (5.0 - p1State.blockDuration <= 2.8 ? 'bg-amber-400' : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]')
                  }`}
                  style={{ width: `${Math.max(0, (1 - p1State.blockDuration / 5.0) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Shield Exhaustion Cooldown */}
          {p1State.blockCooldown > 0 && !p1State.isBlocking && (
            <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400 font-bold mt-0.5 animate-pulse">
              SHIELD EXHAUSTED: {p1State.blockCooldown.toFixed(1)}s
            </span>
          )}

          {p1CanSpecial && !p1State.isBlocking && p1State.blockCooldown <= 0 && (
            <span className="text-[9px] font-display uppercase tracking-widest text-amber-300 font-extrabold mt-0.5">
              SPECIAL READY [L / BTN]
            </span>
          )}
        </div>

        {/* CENTER CLUSTER: TIMER & ROUND INFO */}
        <div className="flex flex-col items-center shrink-0 px-2 md:px-4">
          <div className="px-3 py-1 bg-slate-950/90 border border-slate-800 rounded flex flex-col items-center shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            <span className="text-[10px] font-display font-bold tracking-widest text-amber-400 uppercase">
              {trainingMode ? 'TRAINING' : `ROUND ${currentRound}`}
            </span>
            <span className="font-mono tabular-nums text-3xl md:text-5xl font-black text-slate-100 leading-none py-0.5 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
              {trainingMode ? '∞' : Math.ceil(roundTimer)}
            </span>
          </div>
        </div>

        {/* CPU / OPPONENT CLUSTER */}
        <div className="flex-1 flex flex-col items-end min-w-0">
          {/* Header info */}
          <div className="flex items-center gap-2 mb-1">
            {/* Rounds Won */}
            <div className="flex items-center gap-1 mr-2">
              {[0, 1].map((rIdx) => (
                <div
                  key={rIdx}
                  className={`w-3 h-3 rounded-full border border-rose-400/80 transition-all ${
                    cpuState.roundsWon > rIdx ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-slate-900/60'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] md:text-xs font-mono text-rose-200/60 uppercase hidden sm:inline">
              CPU
            </span>
            <span className="font-display font-black text-lg md:text-2xl tracking-wider text-rose-400 uppercase drop-shadow-[0_2px_8px_rgba(244,63,94,0.6)] truncate">
              {cpuState.definition.name}
            </span>
          </div>

          {/* Health Bar (Reversed direction) */}
          <div className="w-full h-5 md:h-7 bg-slate-950/80 border border-rose-500/40 rounded-sm overflow-hidden p-0.5 shadow-[0_0_12px_rgba(0,0,0,0.8)] flex justify-end">
            <div
              className={`h-full transition-all duration-150 ease-out ${
                cpuHpPercent < 30
                  ? 'bg-gradient-to-l from-red-600 to-rose-400 animate-pulse'
                  : 'bg-gradient-to-l from-rose-600 via-rose-500 to-red-400'
              }`}
              style={{ width: `${cpuHpPercent}%` }}
            />
          </div>

          {/* HP Numbers & Energy */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-300 mt-1">
            {cpuState.passiveTriggered ? (
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider animate-bounce">
                {cpuState.definition.passiveAbility.name} ACTIVE!
              </span>
            ) : <div />}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{cpuState.definition.stats.maxHealth}</span>
              <span className="text-slate-500">/</span>
              <span className="font-bold text-rose-300">{Math.ceil(cpuState.currentHealth)}</span>
            </div>
          </div>

          {/* Energy Gauge */}
          <div className="w-4/5 h-2 bg-slate-950/80 border border-slate-700 rounded-sm overflow-hidden mt-1 p-px flex justify-end">
            <div
              className={`h-full transition-all duration-100 ${
                cpuCanSpecial
                  ? 'bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-200 animate-pulse shadow-[0_0_8px_#f59e0b]'
                  : 'bg-gradient-to-l from-purple-700 to-rose-500'
              }`}
              style={{ width: `${cpuEnergyPercent}%` }}
            />
          </div>

          {/* Shield Durability Gauge (5s Max Duration) */}
          {cpuState.isBlocking && (
            <div className="w-4/5 mt-1 flex flex-col gap-0.5 items-end">
              <div className="flex justify-between items-center text-[9px] font-mono font-bold w-full">
                <span className="text-slate-500">MAX 5.0s</span>
                <span className={5.0 - cpuState.blockDuration <= 1.5 ? 'text-red-400 animate-pulse' : 'text-rose-300'}>
                  SHIELD: {(Math.max(0, 5.0 - cpuState.blockDuration)).toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 border border-rose-800 rounded-sm overflow-hidden p-px flex justify-end">
                <div
                  className={`h-full transition-all duration-75 ${
                    5.0 - cpuState.blockDuration <= 1.5
                      ? 'bg-red-500 animate-pulse'
                      : (5.0 - cpuState.blockDuration <= 2.8 ? 'bg-amber-400' : 'bg-rose-400 shadow-[0_0_6px_#f43f5e]')
                  }`}
                  style={{ width: `${Math.max(0, (1 - cpuState.blockDuration / 5.0) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Shield Exhaustion Cooldown */}
          {cpuState.blockCooldown > 0 && !cpuState.isBlocking && (
            <span className="text-[9px] font-mono uppercase tracking-wider text-rose-400 font-bold mt-0.5 animate-pulse">
              SHIELD EXHAUSTED: {cpuState.blockCooldown.toFixed(1)}s
            </span>
          )}

          {cpuCanSpecial && !cpuState.isBlocking && cpuState.blockCooldown <= 0 && (
            <span className="text-[9px] font-display uppercase tracking-widest text-amber-300 font-extrabold mt-0.5">
              SPECIAL CHARGED
            </span>
          )}
        </div>
      </div>

      {/* COMBAT OVERLAYS & ANNOUNCER TEXT */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        {roundState === 'intro' && (
          <div className="text-center animate-bounce">
            <div className="font-display font-black text-5xl md:text-7xl tracking-widest text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.8)] uppercase">
              {currentRound === 1 ? 'READY' : `ROUND ${currentRound}`}
            </div>
            <div className="text-sm md:text-base font-mono text-cyan-300 uppercase tracking-widest mt-1">
              FIGHT!
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS & COACH BUTTON */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePause}
            className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer backdrop-blur-sm transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          <button
            onClick={onOpenCoach}
            className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/60 rounded text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer backdrop-blur-sm transition-colors"
          >
            <span>TACTICAL COACH</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded cursor-pointer backdrop-blur-sm transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
