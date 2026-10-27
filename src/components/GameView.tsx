import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CombatEngine, ARENA_WIDTH, ARENA_HEIGHT, GROUND_Y } from '../game/engine/CombatEngine';
import { FighterDefinition, MatchTelemetry, ReplayFrame, CombatEvent } from '../types/fighter';
import { ArenaDefinition, ARENAS } from '../data/arenas';
import { FighterRenderer } from './FighterRenderer';
import { GameHUD } from './GameHUD';
import { TouchControls } from './TouchControls';
import { LiveCommentary } from './LiveCommentary';
import { BattlefieldBackground } from './BattlefieldBackground';

interface GameViewProps {
  p1Fighter: FighterDefinition;
  cpuFighter: FighterDefinition;
  arena: ArenaDefinition;
  trainingMode?: boolean;
  onMatchComplete: (winner: 'p1' | 'cpu', telemetry: MatchTelemetry, replayFrames: ReplayFrame[]) => void;
  onOpenCoach: () => void;
  onExitToMenu: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  p1Fighter,
  cpuFighter,
  arena,
  trainingMode = false,
  onMatchComplete,
  onOpenCoach,
  onExitToMenu
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CombatEngine | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  // Live commentary events list
  const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([]);

  // React state for HUD updates at 30-60hz
  const [hudState, setHudState] = useState<{
    p1: any;
    cpu: any;
    roundTimer: number;
    currentRound: number;
    roundState: 'intro' | 'fight' | 'round_over' | 'match_over';
  } | null>(null);

  // Keyboard input states
  const keysPressedRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    punch: false,
    kick: false,
    special: false,
    block: false,
  });

  // Touch input states
  const touchInputHandler = useCallback((action: string, isPressed: boolean) => {
    const keys = keysPressedRef.current;
    if (action === 'left') keys.left = isPressed;
    if (action === 'right') keys.right = isPressed;
    if (action === 'up') keys.up = isPressed;
    if (action === 'down') keys.down = isPressed;
    if (action === 'punch') keys.punch = isPressed;
    if (action === 'kick') keys.kick = isPressed;
    if (action === 'special') keys.special = isPressed;
    if (action === 'block') keys.block = isPressed;
  }, []);

  // Initialize CombatEngine
  useEffect(() => {
    const engine = new CombatEngine(p1Fighter, cpuFighter, {
      trainingMode,
      onCombatEvent: (event) => {
        setCombatEvents(prev => [...prev.slice(-15), event]);
      },
      onMatchEnd: (winner, telemetry, replayFrames) => {
        onMatchComplete(winner, telemetry, replayFrames);
      }
    });
    engineRef.current = engine;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPausedRef.current && engineRef.current) {
        // Run simulation update
        engineRef.current.update(dt, keysPressedRef.current);

        // Reset one-shot attack keypresses
        keysPressedRef.current.punch = false;
        keysPressedRef.current.kick = false;
        keysPressedRef.current.special = false;

        // Sync HUD state
        setHudState({
          p1: { ...engineRef.current.p1 },
          cpu: { ...engineRef.current.cpu },
          roundTimer: engineRef.current.roundTimer,
          currentRound: engineRef.current.currentRound,
          roundState: engineRef.current.roundState,
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [p1Fighter, cpuFighter, trainingMode, onMatchComplete]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const k = e.key.toLowerCase();
      const keys = keysPressedRef.current;

      if (k === 'a' || k === 'arrowleft') keys.left = true;
      if (k === 'd' || k === 'arrowright') keys.right = true;
      if (k === 'w' || k === 'arrowup') keys.up = true;
      if (k === 's' || k === 'arrowdown') keys.down = true;

      // Combat actions
      if (k === 'j' || k === 'z') keys.punch = true;
      if (k === 'k' || k === 'x') keys.kick = true;
      if (k === 'l' || k === 'c') keys.special = true;
      if (k === ' ' || k === 'shift') keys.block = true;

      // Pause toggle
      if (k === 'escape' || k === 'p') {
        setIsPaused(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const keys = keysPressedRef.current;

      if (k === 'a' || k === 'arrowleft') keys.left = false;
      if (k === 'd' || k === 'arrowright') keys.right = false;
      if (k === 'w' || k === 'arrowup') keys.up = false;
      if (k === 's' || k === 'arrowdown') keys.down = false;

      if (k === ' ' || k === 'shift') keys.block = false;
    };

    const handleBlur = () => {
      // Clear held keys on blur
      keysPressedRef.current = {
        left: false,
        right: false,
        up: false,
        down: false,
        punch: false,
        kick: false,
        special: false,
        block: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const engine = engineRef.current;
  const shakeOffset = engine && engine.screenShake > 0
    ? (Math.random() - 0.5) * engine.screenShake
    : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-[#05070c] overflow-hidden select-none"
    >
      {/* 16:9 COMBAT VIEWPORT CONTAINER */}
      <div
        className="relative w-full max-w-[1280px] aspect-[16/9] max-h-screen overflow-hidden shadow-2xl border border-slate-800/80"
        style={{
          transform: `translate(${shakeOffset}px, ${shakeOffset * 0.7}px)`,
        }}
      >
        {/* HIGH-AESTHETIC MULTI-LAYERED BATTLEFIELD ENVIRONMENT */}
        <BattlefieldBackground arena={arena} screenShake={shakeOffset} />

        {/* COMBAT SIMULATION SVG LAYER (Projectiles, Particles, Fighters) */}
        <div className="absolute inset-0">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${ARENA_WIDTH} ${ARENA_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow-fx" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* PROJECTILES */}
            {engine && engine.projectiles.map(p => (
              <g key={p.id} transform={`translate(${p.x}, ${p.y})`}>
                <ellipse
                  cx="0"
                  cy="0"
                  rx={p.width / 2}
                  ry={p.height / 2}
                  fill={p.color}
                  filter="url(#glow-fx)"
                  className="animate-pulse"
                />
                <circle cx="0" cy="0" r={p.height / 3} fill="#ffffff" />
              </g>
            ))}

            {/* PARTICLES */}
            {engine && engine.particles.map(pt => {
              const opacity = pt.life / pt.maxLife;
              if (pt.type === 'ring') {
                return (
                  <circle
                    key={pt.id}
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.size}
                    fill="none"
                    stroke={pt.color}
                    strokeWidth="3"
                    opacity={opacity}
                  />
                );
              }
              if (pt.type === 'slash') {
                return (
                  <path
                    key={pt.id}
                    d={`M ${pt.x - pt.size} ${pt.y + 20} Q ${pt.x} ${pt.y - 30} ${pt.x + pt.size} ${pt.y - 10}`}
                    stroke={pt.color}
                    strokeWidth="4"
                    fill="none"
                    opacity={opacity}
                    filter="url(#glow-fx)"
                  />
                );
              }
              return (
                <circle
                  key={pt.id}
                  cx={pt.x}
                  cy={pt.y}
                  r={pt.size}
                  fill={pt.color}
                  opacity={opacity}
                />
              );
            })}

            {/* FLOATING COMBAT TEXT */}
            {engine && engine.floatingTexts.map(txt => (
              <text
                key={txt.id}
                x={txt.x}
                y={txt.y}
                fill={txt.color}
                fontSize={20 * txt.scale}
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="900"
                textAnchor="middle"
                opacity={Math.min(1, txt.life * 1.5)}
                className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
              >
                {txt.text}
              </text>
            ))}
          </svg>

          {/* PLAYER 1 FIGHTER RENDERER */}
          {engine && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(engine.p1.x / ARENA_WIDTH) * 100}%`,
                top: `${(engine.p1.y / ARENA_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <FighterRenderer
                fighter={engine.p1.definition}
                combatState={engine.p1}
                scale={1.2}
              />
            </div>
          )}

          {/* CPU FIGHTER RENDERER */}
          {engine && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${(engine.cpu.x / ARENA_WIDTH) * 100}%`,
                top: `${(engine.cpu.y / ARENA_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <FighterRenderer
                fighter={engine.cpu.definition}
                combatState={engine.cpu}
                scale={1.2}
              />
            </div>
          )}
        </div>

        {/* COMBAT HUD */}
        {hudState && (
          <GameHUD
            p1State={hudState.p1}
            cpuState={hudState.cpu}
            roundTimer={hudState.roundTimer}
            currentRound={hudState.currentRound}
            roundState={hudState.roundState}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(prev => !prev)}
            onOpenCoach={onOpenCoach}
            trainingMode={trainingMode}
          />
        )}

        {/* LIVE COMMENTARY BROADCAST BANNER */}
        <div className="absolute top-[82px] md:top-[92px] left-0 right-0 z-20 px-4 pointer-events-none flex justify-center">
          <LiveCommentary
            events={combatEvents}
            p1Name={p1Fighter.name}
            cpuName={cpuFighter.name}
          />
        </div>

        {/* TOUCH CONTROLS */}
        <TouchControls
          onInput={touchInputHandler}
          canSpecial={
            Boolean(
              hudState?.p1 &&
              hudState.p1.currentEnergy >= hudState.p1.definition.specialMove.energyCost &&
              hudState.p1.specialCooldown <= 0
            )
          }
          isBlockExhausted={Boolean(hudState?.p1 && (hudState.p1.blockCooldown > 0 || hudState.p1.blockDuration >= 5.0))}
          blockRemaining={hudState?.p1 ? Math.max(0, 5.0 - hudState.p1.blockDuration) : 5.0}
        />

        {/* PAUSE MODAL */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 select-none">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl text-center">
              <h2 className="font-display font-black text-3xl text-cyan-400 tracking-wider uppercase mb-1">
                COMBAT PAUSED
              </h2>
              <p className="text-xs text-slate-400 font-mono mb-6">
                Press ESC or P to resume fighting
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-display font-bold text-lg rounded-lg uppercase tracking-wider cursor-pointer shadow-lg transition-colors"
                >
                  RESUME BATTLE
                </button>
                <button
                  onClick={onOpenCoach}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-sm border border-cyan-800/60 rounded-lg cursor-pointer transition-colors"
                >
                  CALL TACTICAL COACH
                </button>
                <button
                  onClick={onExitToMenu}
                  className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-mono text-sm border border-rose-800/40 rounded-lg cursor-pointer transition-colors"
                >
                  EXIT TO MAIN MENU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
