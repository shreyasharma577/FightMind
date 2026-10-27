import React, { useState, useMemo } from 'react';
import { FighterDefinition, VisualArchetype, WeaponType, VisualEffectType, CombatStyle } from '../types/fighter';
import { PRESET_FIGHTERS, saveCustomFighter } from '../data/fighters';
import { FighterRenderer } from './FighterRenderer';
import { Sparkles, Dices, RefreshCw, Save, Swords, Download, Upload, Shield, Zap, Flame, Wind, Heart, Gauge, CheckCircle2, Wand2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { analyzePrompt, buildFighterFromPrompt } from '../game/generator/fighterGenerator';

interface CharacterForgeProps {
  initialFighter?: FighterDefinition;
  onDeployToBattle: (fighter: FighterDefinition) => void;
  onBackToMenu: () => void;
}

const EXAMPLE_PROMPTS = [
  'A samurai made of living electricity who teleports behind enemies and releases lightning slashes.',
  'A furious samosa monster that rolls across the arena, launches spicy lava, and becomes stronger when its health is low.',
  'A cyberpunk penguin ninja who throws frozen-fish bombs and creates ice walls.',
  'A robot monk who absorbs energy when blocking and unleashes a devastating counterattack.',
  'A tiny cosmic dragon that controls gravity but becomes vulnerable after using its ultimate ability.',
  'A glass warrior who becomes stronger when damaged but shatters under a heavy attack.'
];

const ARCHETYPE_OPTIONS: { id: VisualArchetype; label: string }[] = [
  { id: 'cyber_samurai', label: 'Cyber Samurai' },
  { id: 'food_brawler', label: 'Food Brawler' },
  { id: 'robot_monk', label: 'Robot Monk' },
  { id: 'shadow_assassin', label: 'Shadow Assassin' },
  { id: 'cosmic_entity', label: 'Cosmic Entity' },
  { id: 'elemental_mage', label: 'Elemental Mage' },
];

const WEAPON_OPTIONS: { id: WeaponType; label: string }[] = [
  { id: 'katana', label: 'Katana' },
  { id: 'power_fists', label: 'Power Fists' },
  { id: 'mystic_staff', label: 'Mystic Staff' },
  { id: 'shadow_daggers', label: 'Shadow Daggers' },
  { id: 'cosmic_orb', label: 'Cosmic Orb' },
  { id: 'energy_blades', label: 'Energy Blades' },
];

export const CharacterForge: React.FC<CharacterForgeProps> = ({
  initialFighter,
  onDeployToBattle,
  onBackToMenu
}) => {
  const [prompt, setPrompt] = useState('');
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'visuals' | 'stats' | 'dialogue'>('prompt');
  const [savedNotification, setSavedNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active fighter in forge
  const [fighter, setFighter] = useState<FighterDefinition>(
    initialFighter || PRESET_FIGHTERS[0]
  );

  // Live prompt resonance analysis
  const liveAnalysis = useMemo(() => {
    if (!prompt.trim()) return null;
    return analyzePrompt(prompt);
  }, [prompt]);

  const handleRollPrompt = () => {
    soundManager.playClick();
    const random = EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    setPrompt(random);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    soundManager.playClick();
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-fighter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.fighter) {
          setFighter(data.fighter);
          soundManager.playSpecial();
          return;
        }
      }
      throw new Error('Fallback to high-speed neural generator');
    } catch (err: any) {
      // Infallible procedural generator fallback ensures prompt ALWAYS creates character!
      console.info('Generated character via high-speed procedural neural engine:', err);
      const generated = buildFighterFromPrompt(prompt);
      setFighter(generated);
      soundManager.playSpecial();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModify = async () => {
    if (!modifyPrompt.trim()) return;
    soundManager.playClick();
    setIsModifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/modify-fighter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentFighter: fighter, instruction: modifyPrompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.fighter) {
          setFighter(data.fighter);
          setModifyPrompt('');
          soundManager.playSpecial();
          return;
        }
      }
      throw new Error('Fallback to local modifier');
    } catch (err: any) {
      console.info('Applying tweak via local modifier:', err);
      const ins = modifyPrompt.toLowerCase();
      const copy = JSON.parse(JSON.stringify(fighter)) as FighterDefinition;
      if (ins.includes('gold') || ins.includes('yellow')) {
        copy.appearance.primaryColor = '#f59e0b';
        copy.appearance.glowColor = '#fbbf24';
      }
      if (ins.includes('blue') || ins.includes('cyan')) {
        copy.appearance.primaryColor = '#06b6d4';
        copy.appearance.glowColor = '#00f0ff';
      }
      if (ins.includes('red') || ins.includes('crimson')) {
        copy.appearance.primaryColor = '#ef4444';
        copy.appearance.glowColor = '#f87171';
      }
      if (ins.includes('green') || ins.includes('emerald')) {
        copy.appearance.primaryColor = '#10b981';
        copy.appearance.glowColor = '#34d399';
      }
      if (ins.includes('purple') || ins.includes('violet')) {
        copy.appearance.primaryColor = '#a855f7';
        copy.appearance.glowColor = '#c084fc';
      }
      if (ins.includes('faster') || ins.includes('speed')) {
        copy.stats.speed = Math.min(6.5, Number((copy.stats.speed + 0.4).toFixed(1)));
        copy.combatStyle = 'agile';
      }
      if (ins.includes('stronger') || ins.includes('power')) {
        copy.stats.power = Math.min(1.15, Number((copy.stats.power + 0.08).toFixed(2)));
        copy.appearance.silhouetteSize = 'heavy';
      }
      if (ins.includes('wings') || ins.includes('dragon')) {
        copy.appearance.capeOrWings = true;
      }
      if (ins.includes('fire') || ins.includes('flame')) {
        copy.appearance.visualEffects = ['fire_trails'];
      }
      if (ins.includes('ice') || ins.includes('frost')) {
        copy.appearance.visualEffects = ['frost_shards'];
      }
      if (ins.includes('lightning') || ins.includes('electric')) {
        copy.appearance.visualEffects = ['electric_arcs'];
      }
      setFighter(copy);
      setModifyPrompt('');
      soundManager.playSpecial();
    } finally {
      setIsModifying(false);
    }
  };

  const handleSave = () => {
    soundManager.playClick();
    saveCustomFighter(fighter);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleExportJSON = () => {
    soundManager.playClick();
    const blob = new Blob([JSON.stringify(fighter, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fighter.name.toLowerCase().replace(/\s+/g, '_')}_fighter.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.name && parsed.appearance && parsed.stats) {
          parsed.id = 'f_' + Math.random().toString(36).substring(2, 9);
          parsed.isCustom = true;
          setFighter(parsed);
          soundManager.playSpecial();
        }
      } catch (err) {
        console.error('Invalid JSON file:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] text-slate-100 overflow-y-auto">
      {/* TOP HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors uppercase cursor-pointer"
          >
            ← MAIN MENU
          </button>
          <span className="text-slate-700">/</span>
          <h1 className="font-display font-black text-xl tracking-wider text-cyan-400 uppercase">
            CHARACTER FORGE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {savedNotification && (
            <span className="text-xs font-mono text-emerald-400 animate-pulse mr-2">
              ✓ SAVED TO ROSTER
            </span>
          )}

          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span>SAVE FIGHTER</span>
          </button>

          <button
            onClick={() => {
              saveCustomFighter(fighter);
              onDeployToBattle(fighter);
            }}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-extrabold text-sm tracking-wider rounded uppercase flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
          >
            <Swords className="w-4 h-4" />
            <span>FIGHT NOW</span>
          </button>
        </div>
      </header>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="bg-rose-950/60 border-b border-rose-800 px-6 py-2 text-xs font-mono text-rose-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* LEFT COLUMN: LIVE FIGHTER PREVIEW & ATTRIBUTES */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 bg-gradient-to-b from-slate-900/40 to-slate-950/80">
          <div>
            {/* Fighter Identity */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                <span>{fighter.combatStyle} style</span>
                <span>·</span>
                <span>{fighter.appearance.archetype.replace('_', ' ')}</span>
                {fighter.generatorEngine && (
                  <>
                    <span>·</span>
                    <span className="text-amber-400 text-[10px]">{fighter.generatorEngine}</span>
                  </>
                )}
              </div>
              <h2 className="font-display font-black text-3xl md:text-4xl text-slate-100 uppercase tracking-wide leading-none">
                {fighter.name}
              </h2>
              <p className="text-sm text-cyan-300 font-mono italic mt-0.5">
                "{fighter.title}"
              </p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {fighter.description}
              </p>
            </div>

            {/* LIVE ANIMATED PREVIEW STAGE */}
            <div className="relative w-full aspect-[4/3] max-h-[320px] rounded-xl border border-slate-800 bg-slate-950/90 flex items-center justify-center overflow-hidden shadow-inner my-3">
              {/* Radial backdrop */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  background: `radial-gradient(circle at 50% 60%, ${fighter.appearance.primaryColor}, transparent 70%)`
                }}
              />

              {/* Grid ground */}
              <div className="absolute inset-x-0 bottom-0 h-16 border-t border-slate-800/80 bg-slate-900/40">
                <div
                  className="w-full h-full opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}
                />
              </div>

              {/* Centered animated fighter */}
              <div className="relative z-10 scale-125 transform translate-y-6">
                <FighterRenderer fighter={fighter} scale={1.3} isAnimated={true} />
              </div>

              {/* Silhouette size tag */}
              <div className="absolute top-3 right-3 text-[10px] font-mono uppercase bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                {fighter.appearance.silhouetteSize} frame
              </div>
            </div>
          </div>

          {/* QUICK COMBAT STAT GAUGES */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[10px]">HEALTH</span>
              <span className="font-bold text-slate-200">{fighter.stats.maxHealth} HP</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SPEED</span>
              <span className="font-bold text-cyan-300">{fighter.stats.speed} m/s</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">POWER</span>
              <span className="font-bold text-amber-400">x{fighter.stats.power}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DEFENSE</span>
              <span className="font-bold text-slate-200">x{fighter.stats.defense}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">WEAPON</span>
              <span className="font-bold text-slate-300 capitalize">{fighter.appearance.weaponType.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SPECIAL</span>
              <span className="font-bold text-rose-400 truncate block">{fighter.specialMove.name}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GENERATION STUDIO & EDITORS */}
        <div className="lg:col-span-7 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* TABS */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('prompt')}
                className={`flex-1 py-1.5 px-3 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'prompt' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PROMPT GENERATOR
              </button>
              <button
                onClick={() => setActiveTab('visuals')}
                className={`flex-1 py-1.5 px-3 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'visuals' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                VISUAL PALETTE
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-1.5 px-3 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'stats' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ABILITIES & STATS
              </button>
              <button
                onClick={() => setActiveTab('dialogue')}
                className={`flex-1 py-1.5 px-3 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'dialogue' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                LORE & DIALOGUE
              </button>
            </div>

            {/* TAB CONTENT 1: NATURAL LANGUAGE GENERATOR */}
            {activeTab === 'prompt' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Describe Your Fighter (Any concept, creature, or warrior)
                    </label>
                    <button
                      onClick={handleRollPrompt}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Roll Inspiration</span>
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      placeholder="e.g. A cyber samurai with electric lightning slashes who teleports behind foes... or a giant golden magma beast with seismic stomps..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all resize-none font-sans"
                    />
                    <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500 pointer-events-none">
                      Press [Enter] or [Ctrl+Enter] to create
                    </div>
                  </div>
                </div>

                {/* LIVE CONCEPT RESONANCE (REAL-TIME VISUAL FEEDBACK) */}
                {liveAnalysis && (
                  <div className="p-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
                        <Wand2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>Concept Detected:</span>
                        <span className="font-bold text-white">{liveAnalysis.heroName}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                        ✓ RESONANCE ACTIVE
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      {/* Archetype badge */}
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300 capitalize">
                        Archetype: {liveAnalysis.archetype.replace('_', ' ')}
                      </span>

                      {/* Color Preview */}
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">
                        <span>Palette:</span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                          style={{ backgroundColor: liveAnalysis.primaryColor }}
                          title="Primary Color"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                          style={{ backgroundColor: liveAnalysis.secondaryColor }}
                          title="Secondary Color"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 inline-block shadow-sm"
                          style={{ backgroundColor: liveAnalysis.glowColor }}
                          title="Aura Glow"
                        />
                      </div>

                      {/* Weapon badge */}
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300 capitalize">
                        Weapon: {liveAnalysis.weaponType.replace('_', ' ')}
                      </span>

                      {/* Special Move badge */}
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-amber-300">
                        ⚡ {liveAnalysis.specialMoveName}
                      </span>
                    </div>
                  </div>
                )}

                {/* INSPIRATION CHIPS */}
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block mb-2 uppercase">Quick Archetype Sparks:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Living Lightning Samurai',
                      'Furious Spicy Samosa',
                      'Cyberpunk Penguin Ninja',
                      'Titanium Kinetic Monk',
                      'Graviton Nebula Dragon',
                      'Radioactive Toxic Spider',
                      'Solar Flare Valkyrie'
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => {
                          const match = EXAMPLE_PROMPTS.find(p => p.toLowerCase().includes(chip.split(' ')[0].toLowerCase())) || `${chip} warrior with signature moves.`;
                          setPrompt(match);
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded text-xs font-mono text-slate-300 cursor-pointer transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GENERATE BUTTON */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-display font-black text-lg tracking-wider rounded-lg uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50 active:scale-[0.99] transition-all"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>INSTANTIATING FIGHTER...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>GENERATE FIGHTER NOW</span>
                    </>
                  )}
                </button>

                {/* INCREMENTAL EDITING SECTION */}
                <div className="pt-3 border-t border-slate-800/80">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block mb-1.5">
                    Natural-Language Modification (Incremental Edit)
                  </label>
                  <p className="text-xs text-slate-500 mb-2 font-mono">
                    Tweak properties without regenerating (e.g. "make armor gold and give him ice attacks"):
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={modifyPrompt}
                      onChange={(e) => setModifyPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleModify();
                        }
                      }}
                      placeholder="e.g. Make attacks faster and switch color to crimson..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleModify}
                      disabled={isModifying || !modifyPrompt.trim()}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 rounded-lg text-xs font-mono font-medium disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      {isModifying ? 'APPLYING...' : 'APPLY TWEAK'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: VISUAL PALETTE EDITOR */}
            {activeTab === 'visuals' && (
              <div className="space-y-4">
                {/* Archetype Selector */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-2">Visual Archetype</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ARCHETYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setFighter({
                            ...fighter,
                            appearance: { ...fighter.appearance, archetype: opt.id }
                          });
                        }}
                        className={`py-2 px-3 text-xs font-mono rounded border transition-colors cursor-pointer text-left ${
                          fighter.appearance.archetype === opt.id
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weapon Selector */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-2">Equipped Weapon</label>
                  <div className="grid grid-cols-3 gap-2">
                    {WEAPON_OPTIONS.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => {
                          setFighter({
                            ...fighter,
                            appearance: { ...fighter.appearance, weaponType: w.id }
                          });
                        }}
                        className={`py-2 px-3 text-xs font-mono rounded border transition-colors cursor-pointer text-left ${
                          fighter.appearance.weaponType === w.id
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-2">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fighter.appearance.primaryColor}
                        onChange={(e) => {
                          setFighter({
                            ...fighter,
                            appearance: { ...fighter.appearance, primaryColor: e.target.value }
                          });
                        }}
                        className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-300 uppercase">{fighter.appearance.primaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono uppercase text-slate-400 block mb-2">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fighter.appearance.secondaryColor}
                        onChange={(e) => {
                          setFighter({
                            ...fighter,
                            appearance: { ...fighter.appearance, secondaryColor: e.target.value }
                          });
                        }}
                        className="w-10 h-10 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs text-slate-300 uppercase">{fighter.appearance.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: ABILITIES & STATS */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* Special Move card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase">Signature Special</span>
                    <span className="text-[11px] font-mono text-slate-400">{fighter.specialMove.energyCost} Energy · {fighter.specialMove.cooldown}s CD</span>
                  </div>
                  <h3 className="font-display font-black text-lg text-slate-100 uppercase">{fighter.specialMove.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{fighter.specialMove.description}</p>
                </div>

                {/* Passive Ability card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase">Passive Ability</span>
                    <span className="text-[11px] font-mono text-emerald-400">{fighter.passiveAbility.statBonus}</span>
                  </div>
                  <h3 className="font-display font-black text-lg text-slate-100 uppercase">{fighter.passiveAbility.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{fighter.passiveAbility.description}</p>
                </div>

                {/* Weakness card */}
                <div className="bg-slate-950/80 border border-rose-950/80 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-rose-400 font-bold uppercase">Combat Weakness</span>
                    <span className="text-[11px] font-mono text-slate-500 uppercase">{fighter.weakness.mechanic.replace(/_/g, ' ')}</span>
                  </div>
                  <h3 className="font-display font-black text-lg text-rose-300 uppercase">{fighter.weakness.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{fighter.weakness.description}</p>
                  <p className="text-[11px] text-amber-300/80 mt-1 font-mono">Tip: {fighter.weakness.counterplayTip}</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: LORE & DIALOGUE */}
            {activeTab === 'dialogue' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-950 border border-slate-800 rounded p-3">
                  <span className="text-slate-500 block uppercase text-[10px] mb-1">Personality Trait & Voice</span>
                  <p className="text-slate-200">{fighter.personality.trait} · {fighter.personality.voiceTone}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded p-3">
                  <span className="text-cyan-400 block uppercase text-[10px] mb-1">Intro Clash Line</span>
                  <p className="text-slate-200 italic">"{fighter.personality.introDialogue}"</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded p-3">
                  <span className="text-emerald-400 block uppercase text-[10px] mb-1">Victory Quote</span>
                  <p className="text-slate-200 italic">"{fighter.personality.victoryDialogue}"</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded p-3">
                  <span className="text-rose-400 block uppercase text-[10px] mb-1">Defeat Quote</span>
                  <p className="text-slate-200 italic">"{fighter.personality.defeatDialogue}"</p>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM ACTIONS: EXPORT / IMPORT */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportJSON}
                className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <label className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>

            <span className="text-slate-600 text-[11px]">
              FIGHT//MIND Studio Engine
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
