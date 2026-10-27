import React, { useEffect, useState } from 'react';
import { FighterDefinition, MatchTelemetry } from '../types/fighter';
import { saveCustomFighter } from '../data/fighters';
import { Sparkles, Check, RefreshCw, Zap, Shield, Flame, Wand2, ArrowRight } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { FighterRenderer } from './FighterRenderer';
import { analyzePrompt } from '../game/generator/fighterGenerator';

interface EvolutionModalProps {
  fighter: FighterDefinition;
  telemetry: MatchTelemetry;
  onEvolutionApplied: (updatedFighter: FighterDefinition) => void;
  onClose: () => void;
}

interface EvolutionOption {
  title: string;
  tagline: string;
  description: string;
  visualUpgrade: string;
  statChanges: string;
  evolutionType: 'attack' | 'defense' | 'special';
  modifiedFighter: FighterDefinition;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  fighter,
  telemetry,
  onEvolutionApplied,
  onClose
}) => {
  const [options, setOptions] = useState<EvolutionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isApplyingCustom, setIsApplyingCustom] = useState(false);

  // Generate 3 truly impactful, visually and mechanically transformative evolutions
  useEffect(() => {
    // 1. High-Impact Attack Upgrade: Blazing Strike Form
    const attackFighter: FighterDefinition = JSON.parse(JSON.stringify(fighter));
    attackFighter.appearance.visualEffects = Array.from(new Set([...attackFighter.appearance.visualEffects, 'fire_trails']));
    attackFighter.appearance.primaryColor = '#ef4444';
    attackFighter.appearance.glowColor = '#ff6b35';
    attackFighter.stats.power = Math.min(1.18, Number((attackFighter.stats.power * 1.08).toFixed(2)));
    attackFighter.stats.speed = Math.min(6.5, Number((attackFighter.stats.speed * 1.04).toFixed(1)));
    attackFighter.primaryAttack.name = `Blazing ${attackFighter.primaryAttack.name}`;
    attackFighter.primaryAttack.damage = Math.min(13, attackFighter.primaryAttack.damage + 2);
    attackFighter.specialMove.name = `Infernal ${attackFighter.specialMove.name}`;
    attackFighter.specialMove.damage = Math.min(30, attackFighter.specialMove.damage + 3);

    // 2. High-Impact Defense Upgrade: Aegis Kinetic Fortress
    const defenseFighter: FighterDefinition = JSON.parse(JSON.stringify(fighter));
    defenseFighter.appearance.visualEffects = Array.from(new Set([...defenseFighter.appearance.visualEffects, 'electric_arcs']));
    defenseFighter.appearance.primaryColor = '#38bdf8';
    defenseFighter.appearance.glowColor = '#00f0ff';
    defenseFighter.appearance.silhouetteSize = 'heavy';
    defenseFighter.stats.defense = Math.min(1.20, Number((defenseFighter.stats.defense * 1.12).toFixed(2)));
    defenseFighter.stats.maxHealth = Math.min(115, defenseFighter.stats.maxHealth + 10);
    defenseFighter.passiveAbility.name = 'Harmonic Aegis';
    defenseFighter.passiveAbility.description = 'Reinforces shield with kinetic recoil, reducing block chip damage to near zero.';

    // 3. High-Impact Special Upgrade: Phase Warp Phantom
    const specialFighter: FighterDefinition = JSON.parse(JSON.stringify(fighter));
    specialFighter.appearance.visualEffects = Array.from(new Set([...specialFighter.appearance.visualEffects, 'dark_void']));
    specialFighter.appearance.primaryColor = '#a855f7';
    specialFighter.appearance.glowColor = '#c084fc';
    specialFighter.appearance.capeOrWings = true;
    specialFighter.specialMove.cooldown = Math.max(2.8, Number((specialFighter.specialMove.cooldown - 0.6).toFixed(1)));
    specialFighter.specialMove.name = `Phantom ${specialFighter.specialMove.name}`;
    specialFighter.stats.energyRegen = Number((specialFighter.stats.energyRegen * 1.2).toFixed(2));
    specialFighter.stats.speed = Math.min(6.6, Number((specialFighter.stats.speed * 1.06).toFixed(1)));

    const builtOptions: EvolutionOption[] = [
      {
        title: 'Infernal Strike Surge',
        tagline: 'Offensive Overhaul · Blazing Trail Aura',
        description: 'Imbues weapons and limbs with molten energy. Punches and kicks leave fire trails, dealing enhanced impact damage.',
        visualUpgrade: '🔥 Unlocks Blazing Fire Aura + Crimson Core',
        statChanges: '+8% Power · +2 Attack Damage · +4% Speed',
        evolutionType: 'attack',
        modifiedFighter: attackFighter
      },
      {
        title: 'Aegis Kinetic Fortress',
        tagline: 'Defensive Transmutation · Heavy Frame & Spire Guard',
        description: 'Hardens armor plate into reinforced kinetic composites. Increases maximum health and renders shield defense impenetrable.',
        visualUpgrade: '🛡️ Unlocks Electric Arc Shield + Heavy Frame',
        statChanges: '+12% Damage Mitigation · +10 Max HP',
        evolutionType: 'defense',
        modifiedFighter: defenseFighter
      },
      {
        title: 'Phase Warp Phantom',
        tagline: 'Special Arts Transcendence · Void Cloak & Fast Reset',
        description: 'Integrates dimensional phasing into special techniques. Accelerates energy regeneration and trims special cooldown.',
        visualUpgrade: '🌌 Unlocks Void Cloak + Accelerating Energy Rings',
        statChanges: '-0.6s Special Cooldown · +20% Energy Regen',
        evolutionType: 'special',
        modifiedFighter: specialFighter
      }
    ];

    setOptions(builtOptions);
    setIsLoading(false);
  }, [fighter]);

  const activeModifiedFighter = options[selectedIdx]?.modifiedFighter || fighter;

  const handleApply = (idx: number) => {
    const evo = options[idx];
    if (!evo) return;
    soundManager.playSpecial();
    saveCustomFighter(evo.modifiedFighter);
    onEvolutionApplied(evo.modifiedFighter);
  };

  const handleCustomSurge = () => {
    if (!customPrompt.trim()) return;
    setIsApplyingCustom(true);
    soundManager.playClick();

    const analysis = analyzePrompt(customPrompt);
    const customFighter: FighterDefinition = JSON.parse(JSON.stringify(fighter));

    customFighter.appearance.primaryColor = analysis.primaryColor;
    customFighter.appearance.glowColor = analysis.glowColor;
    customFighter.appearance.visualEffects = analysis.visualEffects;
    if (analysis.hasCapeOrWings) customFighter.appearance.capeOrWings = true;
    if (customPrompt.includes('weapon') || analysis.weaponType) {
      customFighter.appearance.weaponType = analysis.weaponType;
    }
    customFighter.specialMove.name = analysis.specialMoveName;
    customFighter.specialMove.description = analysis.specialMoveDesc;
    customFighter.specialMove.mechanic = analysis.specialMechanic;
    customFighter.description = `${customFighter.description} [Evolved: "${customPrompt.slice(0, 40)}"]`;

    soundManager.playSpecial();
    saveCustomFighter(customFighter);
    onEvolutionApplied(customFighter);
  };

  return (
    <div className="absolute inset-0 bg-[#04060b]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 select-none overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl my-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <h2 className="font-display font-black text-2xl md:text-3xl tracking-wider text-white uppercase leading-none">
                POWER EVOLUTION & ADAPTATION
              </h2>
              <span className="text-xs font-mono text-cyan-400">
                POST-MATCH POWER SURGE · VISIBLE GAMEPLAY & VISUAL IMPACT
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-white uppercase cursor-pointer"
          >
            SKIP / CLOSE
          </button>
        </div>

        {/* WORKSPACE: LEFT PREVIEW + RIGHT UPGRADE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-6">
          {/* LEFT: LIVE TRANSFORMED FIGHTER PREVIEW */}
          <div className="md:col-span-4 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-between">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-2">
              LIVE EVOLUTION PREVIEW
            </span>

            <div className="relative w-full aspect-square max-h-[220px] rounded-lg border border-slate-800/80 bg-slate-950 flex items-center justify-center overflow-hidden my-auto shadow-inner">
              {/* Radial aura glow reflecting evolution */}
              <div
                className="absolute inset-0 pointer-events-none opacity-40 transition-colors duration-300"
                style={{
                  background: `radial-gradient(circle at 50% 60%, ${activeModifiedFighter.appearance.primaryColor}, transparent 70%)`
                }}
              />
              <div className="relative z-10 scale-125 transform translate-y-6">
                <FighterRenderer fighter={activeModifiedFighter} scale={1.25} isAnimated={true} />
              </div>
            </div>

            <div className="w-full text-center mt-3 pt-2 border-t border-slate-800/80">
              <div className="font-display font-black text-lg text-white uppercase">
                {activeModifiedFighter.name}
              </div>
              <div className="text-xs font-mono text-amber-300">
                {options[selectedIdx]?.visualUpgrade || 'Standard Form'}
              </div>
            </div>
          </div>

          {/* RIGHT: 3 DISTINCT HIGH-IMPACT EVOLUTION CHOICES */}
          <div className="md:col-span-8 flex flex-col justify-between space-y-3">
            {options.map((opt, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedIdx(idx);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {opt.evolutionType === 'attack' && <Flame className="w-4 h-4 text-rose-400" />}
                      {opt.evolutionType === 'defense' && <Shield className="w-4 h-4 text-cyan-400" />}
                      {opt.evolutionType === 'special' && <Zap className="w-4 h-4 text-purple-400" />}
                      <span className="font-display font-black text-lg text-white uppercase">
                        {opt.title}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {opt.statChanges}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {opt.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-semibold">{opt.visualUpgrade}</span>
                    {isSelected && (
                      <span className="text-cyan-300 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> SELECTED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CUSTOM POWER SURGE PROMPT INPUT */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl mb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 uppercase mb-1.5">
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Or Unleash Custom Power Surge (Any Prompt)</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Give me golden angel wings with lightning kicks and +15% power..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleCustomSurge}
              disabled={!customPrompt.trim() || isApplyingCustom}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-mono text-xs uppercase rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <span>SURGE NOW</span>
            </button>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleApply(selectedIdx)}
            className="px-8 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-display font-black text-sm uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>APPLY EVOLUTION & BATTLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
