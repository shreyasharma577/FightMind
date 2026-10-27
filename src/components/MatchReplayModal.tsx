import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ReplayFrame, FighterDefinition } from '../types/fighter';
import { ArenaDefinition } from '../data/arenas';
import { FighterRenderer } from './FighterRenderer';
import { ARENA_WIDTH, ARENA_HEIGHT } from '../game/engine/CombatEngine';
import { Play, Pause, RotateCcw, FastForward, Clock, Film, X, Sparkles, ShieldAlert, Zap } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MatchReplayModalProps {
  replayFrames: ReplayFrame[];
  p1Fighter: FighterDefinition;
  cpuFighter: FighterDefinition;
  arena: ArenaDefinition;
  onClose: () => void;
}

export const MatchReplayModal: React.FC<MatchReplayModalProps> = ({
  replayFrames,
  p1Fighter,
  cpuFighter,
  arena,
  onClose
}) => {
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;
  const speedRef = useRef(playbackSpeed);
  speedRef.current = playbackSpeed;

  const totalFrames = replayFrames.length;
  const currentFrame: ReplayFrame | undefined = replayFrames[currentFrameIdx] || replayFrames[0];
  const maxTimestamp = totalFrames > 0 ? replayFrames[totalFrames - 1].timestamp : 0;

  // Find highlight frames
  const highlightEvents = useMemo(() => {
    const list: { index: number; label: string; type: string; time: number }[] = [];
    replayFrames.forEach((frame, idx) => {
      if (frame.eventHighlight) {
        list.push({
          index: idx,
          label: frame.eventHighlight.label,
          type: frame.eventHighlight.type,
          time: frame.timestamp
        });
      }
    });
    return list;
  }, [replayFrames]);

  // Animation frame replay runner
  useEffect(() => {
    if (totalFrames === 0) return;

    let animId: number;
    let lastTime = performance.now();
    let accumulatedTime = 0;

    const loop = (now: number) => {
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlayingRef.current) {
        accumulatedTime += deltaSec * speedRef.current;
        const frameStepDuration = 0.045; // ~22fps sample rate

        if (accumulatedTime >= frameStepDuration) {
          const framesToAdvance = Math.floor(accumulatedTime / frameStepDuration);
          accumulatedTime %= frameStepDuration;

          setCurrentFrameIdx(prev => {
            const next = prev + framesToAdvance;
            if (next >= totalFrames - 1) {
              setIsPlaying(false);
              return totalFrames - 1;
            }
            return next;
          });
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [totalFrames]);

  const handleSeek = (newIndex: number) => {
    const clamped = Math.max(0, Math.min(totalFrames - 1, newIndex));
    setCurrentFrameIdx(clamped);
  };

  const handleRestart = () => {
    soundManager.playClick();
    setCurrentFrameIdx(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    soundManager.playClick();
    if (currentFrameIdx >= totalFrames - 1) {
      setCurrentFrameIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  if (!currentFrame) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 text-white">
        <p>No replay frames recorded for this match.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-800 rounded">Close</button>
      </div>
    );
  }

  // Synthesize CombatFighterState objects for FighterRenderer
  const p1FakeCombatState: any = {
    x: currentFrame.p1.x,
    y: currentFrame.p1.y,
    vx: 0,
    vy: 0,
    facing: currentFrame.p1.facing,
    actionState: currentFrame.p1.actionState,
    isBlocking: currentFrame.p1.isBlocking,
    blockDuration: currentFrame.p1.blockDuration || 0,
    blockCooldown: 0,
    isGrounded: currentFrame.p1.y >= 450,
    stateTimer: 0.15,
    stateDuration: 0.35,
    currentEnergy: currentFrame.p1.energy,
    currentHealth: currentFrame.p1.health
  };

  const cpuFakeCombatState: any = {
    x: currentFrame.cpu.x,
    y: currentFrame.cpu.y,
    vx: 0,
    vy: 0,
    facing: currentFrame.cpu.facing,
    actionState: currentFrame.cpu.actionState,
    isBlocking: currentFrame.cpu.isBlocking,
    blockDuration: currentFrame.cpu.blockDuration || 0,
    blockCooldown: 0,
    isGrounded: currentFrame.cpu.y >= 450,
    stateTimer: 0.15,
    stateDuration: 0.35,
    currentEnergy: currentFrame.cpu.energy,
    currentHealth: currentFrame.cpu.health
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col justify-between select-none">
      {/* TOP HEADER & CONTROLS */}
      <div className="w-full bg-slate-950/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-red-950/80 border border-red-500/80 rounded text-red-300 font-mono text-xs font-bold uppercase tracking-wider animate-pulse">
            <Film className="w-3.5 h-3.5 text-red-400" />
            <span>MATCH REPLAY</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="font-bold text-cyan-400">{p1Fighter.name}</span>
            <span className="text-slate-500">VS</span>
            <span className="font-bold text-rose-400">{cpuFighter.name}</span>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase hidden md:inline">SPEED:</span>
          {([0.5, 1, 2] as const).map(speed => (
            <button
              key={speed}
              onClick={() => {
                soundManager.playClick();
                setPlaybackSpeed(speed);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                playbackSpeed === speed
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_#06b6d4]'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {speed}x {speed === 0.5 ? '(SLOW)' : ''}
            </button>
          ))}

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 ml-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 cursor-pointer"
            title="Close Replay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* REPLAY ARENA STAGE (LETTERBOXED CINEMATIC) */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2">
        <div
          className="relative w-full aspect-[16/9] max-w-5xl rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-black"
          style={{
            transform: currentFrame.screenShake > 0
              ? `translate(${(Math.random() - 0.5) * currentFrame.screenShake}px, ${(Math.random() - 0.5) * currentFrame.screenShake}px)`
              : 'none'
          }}
        >
          {/* Background Arena Sky & Ground */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(to bottom, ${arena.skyGradient[0]}, ${arena.skyGradient[1]})`
            }}
          >
            {/* Ground platform */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                top: `${(460 / ARENA_HEIGHT) * 100}%`,
                backgroundColor: arena.groundColor,
                borderTop: `2px solid ${arena.accentGlow}`,
                boxShadow: `0 -10px 25px ${arena.accentGlow}33`
              }}
            >
              <div
                className="w-full h-full opacity-30"
                style={{
                  backgroundImage: `linear-gradient(${arena.gridLineColor} 1px, transparent 1px), linear-gradient(90deg, ${arena.gridLineColor} 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>
          </div>

          {/* Cinematic Scanlines & Watermark */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-[11px] tracking-widest uppercase font-bold text-red-400 bg-black/60 px-2 py-0.5 rounded border border-red-900/50">
              REC // 60 FPS
            </span>
          </div>

          <div className="absolute top-4 right-4 z-20 pointer-events-none font-mono text-xs text-slate-400 bg-black/60 px-2 py-0.5 rounded border border-slate-800">
            T +{currentFrame.timestamp.toFixed(2)}s
          </div>

          {/* Replay HUD Overlay (HP & Energy) */}
          <div className="absolute top-12 left-4 right-4 z-20 flex justify-between gap-6 pointer-events-none">
            {/* P1 Mini HUD */}
            <div className="w-48 bg-slate-950/80 border border-cyan-800/60 rounded p-1.5 backdrop-blur-sm">
              <div className="flex justify-between text-[10px] font-mono font-bold text-cyan-300">
                <span>{p1Fighter.name}</span>
                <span>{currentFrame.p1.health} HP</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-sm overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                  style={{ width: `${Math.max(0, (currentFrame.p1.health / p1Fighter.stats.maxHealth) * 100)}%` }}
                />
              </div>
            </div>

            {/* CPU Mini HUD */}
            <div className="w-48 bg-slate-950/80 border border-rose-800/60 rounded p-1.5 backdrop-blur-sm">
              <div className="flex justify-between text-[10px] font-mono font-bold text-rose-300">
                <span>{currentFrame.cpu.health} HP</span>
                <span>{cpuFighter.name}</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-sm overflow-hidden mt-1 flex justify-end">
                <div
                  className="h-full bg-gradient-to-l from-rose-600 to-rose-400"
                  style={{ width: `${Math.max(0, (currentFrame.cpu.health / cpuFighter.stats.maxHealth) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Projectiles */}
          {currentFrame.projectiles.map((p, idx) => (
            <div
              key={idx}
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0_0_12px_currentColor]"
              style={{
                left: `${(p.x / ARENA_WIDTH) * 100}%`,
                top: `${(p.y / ARENA_HEIGHT) * 100}%`,
                width: `${p.width}px`,
                height: `${p.height}px`,
                backgroundColor: p.color,
                color: p.color
              }}
            />
          ))}

          {/* Particles */}
          {currentFrame.particles.map((pt, idx) => (
            <div
              key={idx}
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${(pt.x / ARENA_WIDTH) * 100}%`,
                top: `${(pt.y / ARENA_HEIGHT) * 100}%`,
                width: `${pt.size}px`,
                height: `${pt.size}px`,
                backgroundColor: pt.color,
                boxShadow: `0 0 ${pt.size * 1.5}px ${pt.color}`
              }}
            />
          ))}

          {/* Floating Texts */}
          {(currentFrame.floatingTexts || []).map((f, idx) => (
            <div
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 font-display font-black text-sm md:text-base pointer-events-none z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              style={{
                left: `${(f.x / ARENA_WIDTH) * 100}%`,
                top: `${(f.y / ARENA_HEIGHT) * 100}%`,
                color: f.color
              }}
            >
              {f.text}
            </div>
          ))}

          {/* Fighter 1 */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(currentFrame.p1.x / ARENA_WIDTH) * 100}%`,
              top: `${(currentFrame.p1.y / ARENA_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <FighterRenderer
              fighter={p1Fighter}
              combatState={p1FakeCombatState}
              scale={1.2}
              isAnimated={false}
            />
          </div>

          {/* Fighter 2 (CPU) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(currentFrame.cpu.x / ARENA_WIDTH) * 100}%`,
              top: `${(currentFrame.cpu.y / ARENA_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <FighterRenderer
              fighter={cpuFighter}
              combatState={cpuFakeCombatState}
              scale={1.2}
              isAnimated={false}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM CONTROLLER & SCRUBBER */}
      <div className="w-full bg-slate-950/95 border-t border-slate-800 p-4 max-w-5xl mx-auto flex flex-col gap-3 z-30">
        {/* Highlight Chips */}
        {highlightEvents.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            <span className="text-slate-500 uppercase text-[10px] shrink-0">KEY MOMENTS:</span>
            {highlightEvents.map((evt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  handleSeek(evt.index);
                }}
                className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase shrink-0 cursor-pointer transition-colors flex items-center gap-1 ${
                  evt.type === 'ko'
                    ? 'bg-red-950/70 border-red-600 text-red-300 hover:bg-red-900'
                    : (evt.type === 'break'
                      ? 'bg-amber-950/70 border-amber-500 text-amber-300 hover:bg-amber-900'
                      : 'bg-cyan-950/70 border-cyan-500 text-cyan-300 hover:bg-cyan-900')
                }`}
              >
                {evt.type === 'ko' ? <Sparkles className="w-3 h-3 text-red-400" /> : <Zap className="w-3 h-3" />}
                <span>{evt.label}</span>
                <span className="text-slate-400 text-[9px]">({evt.time.toFixed(1)}s)</span>
              </button>
            ))}
          </div>
        )}

        {/* Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400 w-12 text-right">
            {currentFrame.timestamp.toFixed(1)}s
          </span>

          <input
            type="range"
            min={0}
            max={Math.max(1, totalFrames - 1)}
            value={currentFrameIdx}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          <span className="text-xs font-mono text-slate-400 w-12">
            {maxTimestamp.toFixed(1)}s
          </span>
        </div>

        {/* Playback Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={handleRestart}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs uppercase rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            FRAME {currentFrameIdx + 1} / {totalFrames} • USE SLIDER TO INSPECT COMBAT
          </div>
        </div>
      </div>
    </div>
  );
};
