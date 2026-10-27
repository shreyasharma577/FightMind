import React, { useState, useEffect } from 'react';
import { CombatEvent } from '../types/fighter';
import { Mic, MicOff, Radio, Volume2, Sparkles, ShieldAlert, Zap } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface LiveCommentaryProps {
  events: CombatEvent[];
  p1Name: string;
  cpuName: string;
}

export const LiveCommentary: React.FC<LiveCommentaryProps> = ({ events, p1Name, cpuName }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(soundManager.getCommentaryEnabled());
  const [latestEvent, setLatestEvent] = useState<CombatEvent | null>(null);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    if (events.length > 0) {
      const top = events[events.length - 1];
      setLatestEvent(top);
      setFadeKey(prev => prev + 1);
    }
  }, [events]);

  const toggleVoice = () => {
    const next = soundManager.toggleCommentary();
    setVoiceEnabled(next);
  };

  // Event styling
  const getEventBadge = (type: CombatEvent['type']) => {
    switch (type) {
      case 'ko':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />,
          label: 'KNOCKOUT',
          bg: 'bg-red-950/80 border-red-500/80 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
        };
      case 'guard_break':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />,
          label: 'SHIELD BREAK',
          bg: 'bg-amber-950/80 border-red-600/80 text-rose-200 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
        };
      case 'special':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />,
          label: 'SPECIAL MOVE',
          bg: 'bg-purple-950/80 border-purple-500/80 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
        };
      case 'combo':
        return {
          icon: <Zap className="w-3.5 h-3.5 text-cyan-300" />,
          label: 'COMBO BURST',
          bg: 'bg-cyan-950/80 border-cyan-500/80 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
        };
      default:
        return {
          icon: <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />,
          label: 'CASTER',
          bg: 'bg-slate-900/80 border-slate-700 text-slate-200'
        };
    }
  };

  const badge = latestEvent ? getEventBadge(latestEvent.type) : getEventBadge('round_start');

  return (
    <div className="w-full max-w-4xl mx-auto pointer-events-auto select-none mt-2">
      <div className="bg-slate-950/75 backdrop-blur-md border border-slate-800/90 rounded-lg px-3 py-2 flex items-center justify-between gap-3 shadow-lg shadow-black/40">
        {/* Left: Announcer Identity */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse text-cyan-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold leading-tight">
              AI MATCH CASTER
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
              LIVE BROADCAST
            </span>
          </div>

          {/* Event Badge */}
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 ${badge.bg}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Center: Live Commentary Dialogue */}
        <div className="flex-1 min-w-0 px-2 overflow-hidden text-center sm:text-left">
          <div
            key={fadeKey}
            className="text-xs md:text-sm font-sans font-medium text-slate-100 truncate animate-fadeIn flex items-center gap-2"
          >
            <span className="text-amber-400 font-bold font-mono text-xs hidden md:inline">»</span>
            <span className="text-slate-100 font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              {latestEvent
                ? latestEvent.commentaryText
                : `Broadcast active: ${p1Name} vs ${cpuName}. Standing by for combat exchange!`}
            </span>
          </div>
        </div>

        {/* Right: Audio Speech Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleVoice}
            className={`px-2 py-1 rounded border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              voiceEnabled
                ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)] hover:bg-cyan-900'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
            title={voiceEnabled ? 'Mute AI Announcer Voice' : 'Enable AI Announcer Voice'}
          >
            {voiceEnabled ? (
              <>
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xs:inline">VOICE ON</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xs:inline">VOICE OFF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
