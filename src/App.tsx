import React, { useState } from 'react';
import { FighterDefinition, MatchTelemetry, ReplayFrame } from './types/fighter';
import { PRESET_FIGHTERS, getAllFighters } from './data/fighters';
import { ArenaDefinition, ARENAS } from './data/arenas';
import { TitleScreen } from './components/TitleScreen';
import { CharacterForge } from './components/CharacterForge';
import { FighterSelect } from './components/FighterSelect';
import { GameView } from './components/GameView';
import { StatsModal } from './components/StatsModal';
import { EvolutionModal } from './components/EvolutionModal';
import { CoachModal } from './components/CoachModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { MatchReplayModal } from './components/MatchReplayModal';

type AppScreen = 'title' | 'select' | 'forge' | 'combat' | 'training';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('title');

  // Fighters & Arena state
  const [p1Fighter, setP1Fighter] = useState<FighterDefinition>(() => {
    const all = getAllFighters();
    return all[0] || PRESET_FIGHTERS[0];
  });
  const [cpuFighter, setCpuFighter] = useState<FighterDefinition>(() => {
    const all = getAllFighters();
    return all.length > 1 ? all[1] : PRESET_FIGHTERS[1];
  });
  const [selectedArena, setSelectedArena] = useState<ArenaDefinition>(ARENAS[0]);

  // Modals state
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showEvolution, setShowEvolution] = useState(false);
  const [showReplay, setShowReplay] = useState(false);

  // Match Results & Replay Recording
  const [matchWinner, setMatchWinner] = useState<'p1' | 'cpu'>('p1');
  const [lastTelemetry, setLastTelemetry] = useState<MatchTelemetry | null>(null);
  const [lastReplayFrames, setLastReplayFrames] = useState<ReplayFrame[]>([]);

  // Rematch key to force reset GameView
  const [matchKey, setMatchKey] = useState(0);

  const handleStartMatch = (p1: FighterDefinition, cpu: FighterDefinition, arena: ArenaDefinition) => {
    setP1Fighter(p1);
    setCpuFighter(cpu);
    setSelectedArena(arena);
    setShowStats(false);
    setShowEvolution(false);
    setShowCoach(false);
    setMatchKey(prev => prev + 1);
    setCurrentScreen('combat');
  };

  const handleStartTraining = () => {
    const all = getAllFighters();
    setP1Fighter(all[0]);
    setCpuFighter(all.length > 1 ? all[1] : PRESET_FIGHTERS[1]);
    setSelectedArena(ARENAS[2]); // Temple
    setCurrentScreen('training');
  };

  const handleMatchComplete = (winner: 'p1' | 'cpu', telemetry: MatchTelemetry, replayFrames: ReplayFrame[]) => {
    setMatchWinner(winner);
    setLastTelemetry(telemetry);
    setLastReplayFrames(replayFrames);
    setShowStats(true);
  };

  const handleRematch = () => {
    setShowStats(false);
    setShowEvolution(false);
    setMatchKey(prev => prev + 1);
    setCurrentScreen('combat');
  };

  const handleDeployFromForge = (fighter: FighterDefinition) => {
    setP1Fighter(fighter);
    // Auto choose opponent
    const all = getAllFighters().filter(f => f.id !== fighter.id);
    const opponent = all.length > 0 ? all[0] : PRESET_FIGHTERS[1];
    setCpuFighter(opponent);
    setSelectedArena(ARENAS[0]);
    setMatchKey(prev => prev + 1);
    setCurrentScreen('combat');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#05070c] text-slate-100 flex flex-col font-sans relative">
      {/* SCREEN 1: TITLE SCREEN */}
      {currentScreen === 'title' && (
        <TitleScreen
          onStartFight={() => setCurrentScreen('select')}
          onOpenForge={() => setCurrentScreen('forge')}
          onOpenTraining={handleStartTraining}
          onOpenRoster={() => setCurrentScreen('select')}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
        />
      )}

      {/* SCREEN 2: CHARACTER FORGE */}
      {currentScreen === 'forge' && (
        <CharacterForge
          initialFighter={p1Fighter}
          onDeployToBattle={handleDeployFromForge}
          onBackToMenu={() => setCurrentScreen('title')}
        />
      )}

      {/* SCREEN 3: FIGHTER SELECT */}
      {currentScreen === 'select' && (
        <FighterSelect
          onStartMatch={handleStartMatch}
          onOpenForge={(fighterToEdit) => {
            if (fighterToEdit) setP1Fighter(fighterToEdit);
            setCurrentScreen('forge');
          }}
          onBackToMenu={() => setCurrentScreen('title')}
        />
      )}

      {/* SCREEN 4: COMBAT ARENA */}
      {currentScreen === 'combat' && (
        <GameView
          key={matchKey}
          p1Fighter={p1Fighter}
          cpuFighter={cpuFighter}
          arena={selectedArena}
          onMatchComplete={handleMatchComplete}
          onOpenCoach={() => setShowCoach(true)}
          onExitToMenu={() => setCurrentScreen('title')}
        />
      )}

      {/* SCREEN 5: TRAINING DOJO */}
      {currentScreen === 'training' && (
        <GameView
          key={matchKey}
          p1Fighter={p1Fighter}
          cpuFighter={cpuFighter}
          arena={selectedArena}
          trainingMode={true}
          onMatchComplete={() => {}}
          onOpenCoach={() => setShowCoach(true)}
          onExitToMenu={() => setCurrentScreen('title')}
        />
      )}

      {/* MODAL: POST-MATCH STATS */}
      {showStats && lastTelemetry && (
        <StatsModal
          winner={matchWinner}
          p1Fighter={p1Fighter}
          cpuFighter={cpuFighter}
          telemetry={lastTelemetry}
          onRematch={handleRematch}
          onWatchReplay={() => setShowReplay(true)}
          onOpenEvolution={() => {
            setShowStats(false);
            setShowEvolution(true);
          }}
          onEditInForge={() => {
            setShowStats(false);
            setCurrentScreen('forge');
          }}
          onReturnToMenu={() => {
            setShowStats(false);
            setCurrentScreen('title');
          }}
        />
      )}

      {/* MODAL: MATCH REPLAY */}
      {showReplay && lastReplayFrames.length > 0 && (
        <MatchReplayModal
          replayFrames={lastReplayFrames}
          p1Fighter={p1Fighter}
          cpuFighter={cpuFighter}
          arena={selectedArena}
          onClose={() => setShowReplay(false)}
        />
      )}

      {/* MODAL: CHARACTER EVOLUTION */}
      {showEvolution && lastTelemetry && (
        <EvolutionModal
          fighter={p1Fighter}
          telemetry={lastTelemetry}
          onEvolutionApplied={(updated) => {
            setP1Fighter(updated);
            setShowEvolution(false);
            setShowStats(true);
          }}
          onClose={() => {
            setShowEvolution(false);
            setShowStats(true);
          }}
        />
      )}

      {/* MODAL: TACTICAL COACH */}
      {showCoach && (
        <CoachModal
          playerFighter={p1Fighter}
          opponentFighter={cpuFighter}
          telemetry={lastTelemetry || undefined}
          onClose={() => setShowCoach(false)}
        />
      )}

      {/* MODAL: HOW TO PLAY */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </div>
  );
}
