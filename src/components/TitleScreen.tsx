import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Swords, BookOpen, UserPlus, Play, ShieldAlert, Cpu, Flame, Download } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { ThreeTitleBackdrop } from './ThreeTitleBackdrop';

interface TitleScreenProps {
  onStartFight: () => void;
  onOpenForge: () => void;
  onOpenTraining: () => void;
  onOpenRoster: () => void;
  onOpenHowToPlay: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartFight,
  onOpenForge,
  onOpenTraining,
  onOpenRoster,
  onOpenHowToPlay
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleMute = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        soundManager.playClick();
        onStartFight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartFight]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-10 bg-[#04060b] overflow-hidden select-none">
      {/* 3D INTERACTIVE THREE.JS BACKDROP */}
      <ThreeTitleBackdrop />

      {/* TOP HEADER */}
      <header className="w-full max-w-6xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-cyan-500/50 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-display font-black text-sm tracking-wider text-slate-100 uppercase">
              STUDIO NEXUS
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] font-mono font-bold text-cyan-400">3D REALTIME ENGINE</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/80 rounded-full text-[10px] font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>NEURAL CORE ONLINE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/download-zip"
            download="fightmind_source_code.zip"
            className="text-xs font-mono text-cyan-300 hover:text-white px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
            title="Download full project source code as .ZIP"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">EXPORT CODE (.ZIP)</span>
          </a>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenHowToPlay();
            }}
            className="text-xs font-mono text-slate-300 hover:text-cyan-300 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700 hover:border-cyan-500/60 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">HOW TO PLAY</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/60 rounded-lg cursor-pointer shadow-md transition-all"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </header>

      {/* CENTERPIECE: CINEMATIC LOGO LOCKUP */}
      <div className="flex flex-col items-center justify-center text-center z-10 my-auto max-w-4xl px-4 pointer-events-auto">
        {/* Kicker Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-cyan-950/60 border border-cyan-400/40 rounded-full text-xs md:text-sm font-mono tracking-widest text-cyan-300 uppercase mb-4 shadow-[0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>IMAGINE · CREATE · FIGHT</span>
        </div>

        {/* BESPOKE ARCADE LOGO WITH HIGH-CONTRAST GLOW */}
        <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tight text-white uppercase leading-none drop-shadow-[0_4px_35px_rgba(6,182,212,0.6)]">
          FIGHT<span className="text-cyan-400">//</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-rose-400">MIND</span>
        </h1>

        <p className="text-sm md:text-base text-slate-200 font-sans max-w-2xl mt-4 leading-relaxed font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Type any character into reality. Google Gemma interprets your vision into a tournament-balanced fighter with distinctive weapons, real-time arcade mechanics, and cinematic special moves.
        </p>

        {/* FEATURE PILL TAGS */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="px-3 py-1 bg-slate-950/80 border border-cyan-500/40 rounded-full text-xs font-mono text-cyan-300 shadow-sm">
            ⚡ 60 FPS Real-Time Combat
          </span>
          <span className="px-3 py-1 bg-slate-950/80 border border-amber-500/40 rounded-full text-xs font-mono text-amber-300 shadow-sm">
            ⚖️ Balanced Medium AI
          </span>
          <span className="px-3 py-1 bg-slate-950/80 border border-purple-500/40 rounded-full text-xs font-mono text-purple-300 shadow-sm">
            🛡️ 100% Reliable Shield Guard
          </span>
          <span className="px-3 py-1 bg-slate-950/80 border border-rose-500/40 rounded-full text-xs font-mono text-rose-300 shadow-sm">
            🎙️ Live Commentary & Replays
          </span>
        </div>

        {/* PRIMARY CALL TO ACTION BUTTONS */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => {
              soundManager.playClick();
              onStartFight();
            }}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-black text-xl tracking-wider rounded-xl uppercase flex items-center justify-center gap-3 cursor-pointer shadow-[0_0_35px_rgba(6,182,212,0.7)] active:scale-95 transition-all"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>PLAY NOW</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenForge();
            }}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/95 hover:bg-slate-800 text-cyan-300 hover:text-white border-2 border-cyan-400 hover:border-cyan-300 font-display font-black text-lg tracking-wider rounded-xl uppercase flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>CREATE FIGHTER</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 mt-4 tracking-widest uppercase font-semibold">
          PRESS [SPACE] OR [ENTER] TO START BATTLE
        </div>
      </div>

      {/* BOTTOM NAV / SECONDARY MENUS */}
      <footer className="w-full max-w-4xl flex items-center justify-center gap-4 md:gap-8 z-10 pt-4 border-t border-slate-800/90 backdrop-blur-sm">
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenForge();
          }}
          className="text-xs md:text-sm font-mono text-slate-300 hover:text-cyan-400 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <UserPlus className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">Character Forge</span>
        </button>

        <span className="text-slate-700">·</span>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenTraining();
          }}
          className="text-xs md:text-sm font-mono text-slate-300 hover:text-cyan-400 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Swords className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">Training Dojo</span>
        </button>

        <span className="text-slate-700">·</span>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenRoster();
          }}
          className="text-xs md:text-sm font-mono text-slate-300 hover:text-cyan-400 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">Fighter Roster</span>
        </button>

        <span className="text-slate-700">·</span>

        <a
          href="/api/download-zip"
          download="fightmind_source_code.zip"
          className="text-xs md:text-sm font-mono text-cyan-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Download full project code as ZIP"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold">Download ZIP</span>
        </a>
      </footer>
    </div>
  );
};

