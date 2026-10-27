import { GoogleGenAI, Type } from '@google/genai';
import { FighterDefinition, FighterAppearance, FighterStats, FighterAbility, FighterPassive, FighterWeakness, FighterPersonality, VisualArchetype, WeaponType, SpecialMechanic, PassiveMechanic, WeaknessMechanic, CombatStyle, VisualEffectType } from '../types/fighter';

// Centralized model identifier - supports Google Gemma or Gemini 3.8 Flash
export const AI_MODEL_NAME = process.env.GEMMA_MODEL || 'gemini-3.8-flash';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function withTimeout<T>(promise: Promise<T>, ms: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

const FIGHTER_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Short distinct fighter name (e.g., Volt Ronin, Golem X)' },
    title: { type: Type.STRING, description: 'Epic fighting title (e.g., The Stormbound Samurai)' },
    description: { type: Type.STRING, description: '1-2 sentence atmospheric character lore' },
    combatStyle: {
      type: Type.STRING,
      description: 'One of: agile, brawler, balanced, defensive, tactical, rushdown'
    },
    appearance: {
      type: Type.OBJECT,
      properties: {
        archetype: {
          type: Type.STRING,
          description: 'One of: cyber_samurai, elemental_mage, robot_monk, brawler_beast, cosmic_entity, shadow_assassin, food_brawler, armored_titan, bio_mutant, energy_specter'
        },
        primaryColor: { type: Type.STRING, description: 'Hex code like #06b6d4' },
        secondaryColor: { type: Type.STRING, description: 'Hex code like #8b5cf6' },
        accentColor: { type: Type.STRING, description: 'Hex code like #38bdf8' },
        glowColor: { type: Type.STRING, description: 'Hex code like #00f0ff' },
        armorStyle: { type: Type.STRING, description: 'Short description of clothing/armor' },
        weaponType: {
          type: Type.STRING,
          description: 'One of: katana, energy_blades, power_fists, mystic_staff, shadow_daggers, cosmic_orb, heavy_cleaver, unarmed'
        },
        visualEffects: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Subset of: electric_arcs, fire_trails, frost_shards, dark_void, plasma_glow, sacred_light, gravity_rings, bio_spores'
        },
        silhouetteSize: { type: Type.STRING, description: 'compact, medium, heavy, or towering' },
        capeOrWings: { type: Type.BOOLEAN }
      },
      required: ['archetype', 'primaryColor', 'secondaryColor', 'accentColor', 'glowColor', 'armorStyle', 'weaponType', 'visualEffects', 'silhouetteSize']
    },
    stats: {
      type: Type.OBJECT,
      properties: {
        maxHealth: { type: Type.NUMBER, description: 'Between 90 and 125' },
        speed: { type: Type.NUMBER, description: 'Between 4.5 and 7.5' },
        power: { type: Type.NUMBER, description: 'Between 0.85 and 1.35' },
        defense: { type: Type.NUMBER, description: 'Between 0.85 and 1.25' },
        energyRegen: { type: Type.NUMBER, description: 'Between 0.9 and 1.4' },
        jumpForce: { type: Type.NUMBER, description: 'Between 13.0 and 16.0' }
      },
      required: ['maxHealth', 'speed', 'power', 'defense', 'energyRegen', 'jumpForce']
    },
    primaryAttack: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of basic punch/slash' },
        damage: { type: Type.NUMBER, description: 'Damage between 9 and 13' },
        range: { type: Type.NUMBER, description: 'Range between 65 and 100' }
      },
      required: ['name', 'damage', 'range']
    },
    specialMove: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of special attack' },
        description: { type: Type.STRING, description: 'What the move does' },
        damage: { type: Type.NUMBER, description: 'Damage between 22 and 30' },
        energyCost: { type: Type.NUMBER, description: 'Energy cost between 30 and 45' },
        cooldown: { type: Type.NUMBER, description: 'Cooldown in seconds (3.0 - 5.0)' },
        mechanic: {
          type: Type.STRING,
          description: 'One of: teleport_strike, projectile_blast, energy_barrier, ground_slam, vampiric_drain, frenzy_roll, counter_stance, lightning_storm'
        }
      },
      required: ['name', 'description', 'damage', 'energyCost', 'cooldown', 'mechanic']
    },
    passiveAbility: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of passive skill' },
        description: { type: Type.STRING, description: 'Clear explanation of the mechanic' },
        mechanic: {
          type: Type.STRING,
          description: 'One of: low_hp_rage, energy_on_block, speed_boost, counter_damage, frost_slow, gravity_pulse, static_charge, healing_surge'
        },
        statBonus: { type: Type.STRING, description: 'Short summary e.g. +30% attack at low HP' }
      },
      required: ['name', 'description', 'mechanic', 'statBonus']
    },
    weakness: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Name of fighter weakness' },
        description: { type: Type.STRING, description: 'Clear explanation of combat vulnerability' },
        mechanic: {
          type: Type.STRING,
          description: 'One of: heavy_damage_vulnerable, slow_recovery, energy_drain_on_miss, fragile_guard, low_anti_air'
        },
        counterplayTip: { type: Type.STRING, description: 'How opponents can exploit this in match' }
      },
      required: ['name', 'description', 'mechanic', 'counterplayTip']
    },
    personality: {
      type: Type.OBJECT,
      properties: {
        trait: { type: Type.STRING },
        voiceTone: { type: Type.STRING },
        introDialogue: { type: Type.STRING, description: 'Pre-fight clash line' },
        victoryDialogue: { type: Type.STRING, description: 'Post-match victory quote' },
        defeatDialogue: { type: Type.STRING, description: 'Post-match defeat quote' }
      },
      required: ['trait', 'voiceTone', 'introDialogue', 'victoryDialogue', 'defeatDialogue']
    }
  },
  required: ['name', 'title', 'description', 'combatStyle', 'appearance', 'stats', 'primaryAttack', 'specialMove', 'passiveAbility', 'weakness', 'personality']
};

/**
 * Generate a new fighter from natural language prompt using Gemma / Gemini
 */
export async function generateFighterFromPrompt(prompt: string, archetypeHint?: string): Promise<FighterDefinition> {
  const client = getAiClient();

  if (client) {
    try {
      const systemInstruction = `You are the lead character designer and combat balancer for FIGHT//MIND, an arcade fighting game.
Your task is to take the user's natural language character concept and translate it into a distinctive, tournament-balanced 2D arcade fighter.
Ensure the abilities, stats, color schemes, and personality directly embody the player's description.
Return pure valid JSON according to the schema.`;

      const userContent = `Create a playable fighting game character based on this description:
"${prompt}"
${archetypeHint ? `Desired visual archetype hint: ${archetypeHint}` : ''}`;

      const response = await withTimeout(
        client.models.generateContent({
          model: AI_MODEL_NAME,
          contents: userContent,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: FIGHTER_RESPONSE_SCHEMA,
            temperature: 0.75,
          },
        }),
        7000
      );

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return sanitizeFighter(parsed, prompt, `Google Gemma (${AI_MODEL_NAME})`);
      }
    } catch (err) {
      console.warn('Gemma API generation failed or unavailable, falling back to procedural engine:', err);
    }
  }

  // Robust procedural engine fallback
  return generateProceduralFighter(prompt, archetypeHint);
}

/**
 * Modifies an existing fighter incrementally based on player instructions
 */
export async function modifyFighterFromPrompt(current: FighterDefinition, instruction: string): Promise<FighterDefinition> {
  const client = getAiClient();

  if (client) {
    try {
      const systemInstruction = `You are the character editor for FIGHT//MIND.
The user wants to modify their existing fighter based on incremental natural language instructions.
CRITICAL: ONLY change the attributes the user requested (e.g. changing armor color, switching weapon, making them faster, or changing a special move).
Preserve all untouched properties exactly as they are.
Return the complete updated fighter matching the schema.`;

      const userContent = `Existing fighter:
${JSON.stringify(current, null, 2)}

User's requested modification:
"${instruction}"`;

      const response = await withTimeout(
        client.models.generateContent({
          model: AI_MODEL_NAME,
          contents: userContent,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: FIGHTER_RESPONSE_SCHEMA,
            temperature: 0.6,
          },
        }),
        7000
      );

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        const sanitized = sanitizeFighter(parsed, current.creatorPrompt || instruction, `Google Gemma (${AI_MODEL_NAME})`);
        sanitized.id = current.id; // Keep same ID
        return sanitized;
      }
    } catch (err) {
      console.warn('Gemma modification failed, applying procedural patch:', err);
    }
  }

  return applyProceduralModification(current, instruction);
}

/**
 * Generate tactical fight coach analysis
 */
export async function getTacticalCoachAdvice(
  playerFighter: FighterDefinition,
  opponentFighter: FighterDefinition,
  telemetry: any
): Promise<{ advice: string; keyWeakness: string; combatTips: string[] }> {
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `Analyze this FIGHT//MIND match telemetry and provide concise, high-tier arcade coach tips.
Player fighter: ${playerFighter.name} (${playerFighter.title}, style: ${playerFighter.combatStyle})
Opponent: ${opponentFighter.name} (Weakness: ${opponentFighter.weakness.description})
Telemetry: Damage dealt=${telemetry.playerDamageDealt}, Damage taken=${telemetry.opponentDamageDealt}, Player jumps=${telemetry.playerJumps}, Player blocks=${telemetry.playerBlocks}, Specials=${telemetry.playerSpecialsUsed}.

Provide:
1. Short punchy coach takeaway (max 2 sentences)
2. Exploit for opponent's weakness
3. Exactly 3 tactical bullet points.`;

      const response = await withTimeout(
        client.models.generateContent({
          model: AI_MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                advice: { type: Type.STRING },
                keyWeakness: { type: Type.STRING },
                combatTips: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['advice', 'keyWeakness', 'combatTips']
            }
          }
        }),
        7000
      );

      if (response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.warn('Tactical coach AI query failed:', err);
    }
  }

  // Fallback coach advice
  const oppName = opponentFighter?.name || 'your opponent';
  const myAttack = playerFighter?.primaryAttack?.name || 'basic strike';
  const oppSpecial = opponentFighter?.specialMove?.name || 'their special attack';
  const oppWeakness = opponentFighter?.weakness?.counterplayTip || `Target ${oppName}'s recovery frames.`;

  return {
    advice: `Against ${oppName}, tempo and range control are everything. Use your ${myAttack} to bait their guard.`,
    keyWeakness: oppWeakness,
    combatTips: [
      `Bait out ${oppSpecial} and immediately follow up with a heavy kick punish.`,
      `Hold block when close; remember your passive grants advantages during defensive exchanges.`,
      `Don't get predictable with aerial approaches—mix up standing pokes with dash retreats.`
    ]
  };
}

/**
 * Suggest 3 character evolution choices based on match telemetry
 */
export async function getFighterEvolutions(fighter: FighterDefinition, telemetry: any): Promise<Array<{
  title: string;
  description: string;
  statChanges: string;
  evolutionType: 'attack' | 'defense' | 'special';
  modifiedFighter: FighterDefinition;
}>> {
  const client = getAiClient();

  if (client) {
    try {
      const prompt = `Based on match telemetry where ${fighter.name} took ${telemetry.opponentDamageDealt} damage and dealt ${telemetry.playerDamageDealt} damage, suggest 3 balanced character evolutions.
Each evolution adapts the fighter slightly (e.g. enhanced counter, faster projectile, or low-health armor).`;

      const response = await withTimeout(
        client.models.generateContent({
          model: AI_MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  statChanges: { type: Type.STRING },
                  evolutionType: { type: Type.STRING }
                },
                required: ['title', 'description', 'statChanges', 'evolutionType']
              }
            }
          }
        }),
        7000
      );

      if (response.text) {
        const rawList = JSON.parse(response.text.trim());
        return rawList.slice(0, 3).map((item: any) => ({
          title: item.title,
          description: item.description,
          statChanges: item.statChanges,
          evolutionType: item.evolutionType as 'attack' | 'defense' | 'special',
          modifiedFighter: {
            ...fighter,
            stats: {
              ...fighter.stats,
              power: Math.min(1.4, Number((fighter.stats.power * (item.evolutionType === 'attack' ? 1.08 : 1.0)).toFixed(2))),
              defense: Math.min(1.3, Number((fighter.stats.defense * (item.evolutionType === 'defense' ? 1.08 : 1.0)).toFixed(2)))
            },
            evolutionHistory: [...(fighter.evolutionHistory || []), item.title]
          }
        }));
      }
    } catch (err) {
      console.warn('Fighter evolution query failed:', err);
    }
  }

  // Fallback evolutions
  return [
    {
      title: 'Overclocked Strike Form',
      description: 'Hones offensive edge and acceleration for high-pressure engagements.',
      statChanges: '+8% Attack Power, +5% Movement Speed',
      evolutionType: 'attack',
      modifiedFighter: {
        ...fighter,
        stats: { ...fighter.stats, power: Number((fighter.stats.power * 1.08).toFixed(2)), speed: Number((fighter.stats.speed * 1.05).toFixed(1)) },
        evolutionHistory: [...(fighter.evolutionHistory || []), 'Overclocked Strike Form']
      }
    },
    {
      title: 'Aegis Harmonic Armor',
      description: 'Reinforces kinetic dampening to absorb heavier impacts.',
      statChanges: '+10% Damage Mitigation, +10 Max Health',
      evolutionType: 'defense',
      modifiedFighter: {
        ...fighter,
        stats: { ...fighter.stats, defense: Number((fighter.stats.defense * 1.1).toFixed(2)), maxHealth: fighter.stats.maxHealth + 10 },
        evolutionHistory: [...(fighter.evolutionHistory || []), 'Aegis Harmonic Armor']
      }
    },
    {
      title: 'Prismatic Flux Capacitor',
      description: 'Accelerates special move cooldown and increases energy efficiency.',
      statChanges: '-0.5s Special Cooldown, +15% Energy Regen',
      evolutionType: 'special',
      modifiedFighter: {
        ...fighter,
        specialMove: { ...fighter.specialMove, cooldown: Math.max(2.5, fighter.specialMove.cooldown - 0.5) },
        stats: { ...fighter.stats, energyRegen: Number((fighter.stats.energyRegen * 1.15).toFixed(2)) },
        evolutionHistory: [...(fighter.evolutionHistory || []), 'Prismatic Flux Capacitor']
      }
    }
  ];
}

/**
 * Sanitizes and caps fighter properties into valid arcade combat ranges
 */
function sanitizeFighter(raw: any, prompt: string, engineName: string): FighterDefinition {
  const archetypes: VisualArchetype[] = [
    'cyber_samurai', 'elemental_mage', 'robot_monk', 'brawler_beast',
    'cosmic_entity', 'shadow_assassin', 'food_brawler', 'armored_titan',
    'bio_mutant', 'energy_specter'
  ];

  const archetype: VisualArchetype = archetypes.includes(raw.appearance?.archetype)
    ? raw.appearance.archetype
    : 'cyber_samurai';

  const combatStyles: CombatStyle[] = ['agile', 'brawler', 'balanced', 'defensive', 'tactical', 'rushdown'];
  const combatStyle: CombatStyle = combatStyles.includes(raw.combatStyle) ? raw.combatStyle : 'balanced';

  const weaponTypes: WeaponType[] = [
    'katana', 'energy_blades', 'power_fists', 'mystic_staff',
    'shadow_daggers', 'cosmic_orb', 'heavy_cleaver', 'unarmed'
  ];
  const weaponType: WeaponType = weaponTypes.includes(raw.appearance?.weaponType)
    ? raw.appearance.weaponType
    : 'power_fists';

  const specialMechanics: SpecialMechanic[] = [
    'teleport_strike', 'projectile_blast', 'energy_barrier', 'ground_slam',
    'vampiric_drain', 'frenzy_roll', 'counter_stance', 'lightning_storm'
  ];
  const specialMechanic: SpecialMechanic = specialMechanics.includes(raw.specialMove?.mechanic)
    ? raw.specialMove.mechanic
    : 'teleport_strike';

  const passiveMechanics: PassiveMechanic[] = [
    'low_hp_rage', 'energy_on_block', 'speed_boost', 'counter_damage',
    'frost_slow', 'gravity_pulse', 'static_charge', 'healing_surge'
  ];
  const passiveMechanic: PassiveMechanic = passiveMechanics.includes(raw.passiveAbility?.mechanic)
    ? raw.passiveAbility.mechanic
    : 'speed_boost';

  const weaknessMechanics: WeaknessMechanic[] = [
    'heavy_damage_vulnerable', 'slow_recovery', 'energy_drain_on_miss',
    'fragile_guard', 'low_anti_air', 'self_damage_on_ultimate'
  ];
  const weaknessMechanic: WeaknessMechanic = weaknessMechanics.includes(raw.weakness?.mechanic)
    ? raw.weakness.mechanic
    : 'slow_recovery';

  // Clamp stats within strict balance limits
  const stats: FighterStats = {
    maxHealth: Math.max(90, Math.min(130, Number(raw.stats?.maxHealth) || 100)),
    speed: Math.max(4.2, Math.min(7.8, Number(raw.stats?.speed) || 6.0)),
    power: Math.max(0.85, Math.min(1.35, Number(raw.stats?.power) || 1.0)),
    defense: Math.max(0.8, Math.min(1.25, Number(raw.stats?.defense) || 1.0)),
    energyRegen: Math.max(0.8, Math.min(1.5, Number(raw.stats?.energyRegen) || 1.1)),
    jumpForce: Math.max(12.5, Math.min(16.5, Number(raw.stats?.jumpForce) || 14.5))
  };

  const appearance: FighterAppearance = {
    archetype,
    primaryColor: raw.appearance?.primaryColor || '#06b6d4',
    secondaryColor: raw.appearance?.secondaryColor || '#8b5cf6',
    accentColor: raw.appearance?.accentColor || '#38bdf8',
    glowColor: raw.appearance?.glowColor || '#00f0ff',
    armorStyle: String(raw.appearance?.armorStyle || 'Arcade Combat Attire').slice(0, 40),
    weaponType,
    visualEffects: Array.isArray(raw.appearance?.visualEffects) && raw.appearance.visualEffects.length > 0
      ? raw.appearance.visualEffects.slice(0, 3)
      : ['electric_arcs'],
    silhouetteSize: ['compact', 'medium', 'heavy', 'towering'].includes(raw.appearance?.silhouetteSize)
      ? raw.appearance.silhouetteSize
      : 'medium',
    capeOrWings: Boolean(raw.appearance?.capeOrWings)
  };

  const primaryAttack = {
    name: String(raw.primaryAttack?.name || 'Rapid Strike').slice(0, 30),
    damage: Math.max(8, Math.min(14, Number(raw.primaryAttack?.damage) || 10)),
    range: Math.max(65, Math.min(110, Number(raw.primaryAttack?.range) || 80))
  };

  const specialMove: FighterAbility = {
    name: String(raw.specialMove?.name || 'Ultra Arts').slice(0, 30),
    description: String(raw.specialMove?.description || 'Devastating signature technique.').slice(0, 100),
    damage: Math.max(20, Math.min(32, Number(raw.specialMove?.damage) || 25)),
    energyCost: Math.max(25, Math.min(45, Number(raw.specialMove?.energyCost) || 35)),
    cooldown: Math.max(2.5, Math.min(5.5, Number(raw.specialMove?.cooldown) || 3.5)),
    mechanic: specialMechanic
  };

  const passiveAbility: FighterPassive = {
    name: String(raw.passiveAbility?.name || 'Inherent Instinct').slice(0, 30),
    description: String(raw.passiveAbility?.description || 'Grants passive combat benefits.').slice(0, 100),
    mechanic: passiveMechanic,
    statBonus: String(raw.passiveAbility?.statBonus || '+15% Efficiency').slice(0, 40)
  };

  const weakness: FighterWeakness = {
    name: String(raw.weakness?.name || 'Combat Blindspot').slice(0, 30),
    description: String(raw.weakness?.description || 'Vulnerable under specific pressure.').slice(0, 100),
    mechanic: weaknessMechanic,
    counterplayTip: String(raw.weakness?.counterplayTip || 'Exploit recovery frames.').slice(0, 100)
  };

  const personality: FighterPersonality = {
    trait: String(raw.personality?.trait || 'Confident & Relentless').slice(0, 40),
    voiceTone: String(raw.personality?.voiceTone || 'Resonant and sharp').slice(0, 40),
    introDialogue: String(raw.personality?.introDialogue || 'Are you ready for what comes next?').slice(0, 80),
    victoryDialogue: String(raw.personality?.victoryDialogue || 'A decisive conclusion.').slice(0, 80),
    defeatDialogue: String(raw.personality?.defeatDialogue || 'This is not the end...').slice(0, 80)
  };

  return {
    id: 'f_' + Math.random().toString(36).substring(2, 9),
    name: String(raw.name || 'Custom Fighter').slice(0, 24),
    title: String(raw.title || 'The Contender').slice(0, 36),
    description: String(raw.description || 'A mysterious combatant entered into the arena.').slice(0, 160),
    creatorPrompt: prompt,
    isCustom: true,
    modelGenerated: true,
    generatorEngine: engineName,
    combatStyle,
    appearance,
    stats,
    primaryAttack,
    specialMove,
    passiveAbility,
    weakness,
    personality,
    createdAt: Date.now()
  };
}

import { buildFighterFromPrompt } from '../game/generator/fighterGenerator.ts';

/**
 * Intelligent procedural generator fallback that tailors attributes to keywords
 */
function generateProceduralFighter(prompt: string, archetypeHint?: string): FighterDefinition {
  const generated = buildFighterFromPrompt(prompt, archetypeHint);
  return sanitizeFighter(generated, prompt, 'Procedural Generation Engine (Keyword-Aware)');
}

/**
 * Apply fast procedural updates when offline
 */
function applyProceduralModification(current: FighterDefinition, instruction: string): FighterDefinition {
  const ins = instruction.toLowerCase();
  const copy = JSON.parse(JSON.stringify(current)) as FighterDefinition;

  if (ins.includes('gold') || ins.includes('yellow')) {
    copy.appearance.primaryColor = '#f59e0b';
    copy.appearance.glowColor = '#fbbf24';
  }
  if (ins.includes('black') || ins.includes('dark')) {
    copy.appearance.secondaryColor = '#0f172a';
    copy.appearance.visualEffects = ['dark_void'];
  }
  if (ins.includes('blue') || ins.includes('cyan')) {
    copy.appearance.primaryColor = '#06b6d4';
    copy.appearance.glowColor = '#00f0ff';
  }
  if (ins.includes('red') || ins.includes('crimson') || ins.includes('scarlet')) {
    copy.appearance.primaryColor = '#ef4444';
    copy.appearance.glowColor = '#f87171';
  }
  if (ins.includes('purple') || ins.includes('violet')) {
    copy.appearance.primaryColor = '#a855f7';
    copy.appearance.glowColor = '#c084fc';
  }
  if (ins.includes('green') || ins.includes('emerald') || ins.includes('toxic')) {
    copy.appearance.primaryColor = '#10b981';
    copy.appearance.glowColor = '#34d399';
    copy.appearance.visualEffects = ['bio_spores'];
  }

  if (ins.includes('faster') || ins.includes('speed')) {
    copy.stats.speed = Math.min(6.5, Number((copy.stats.speed + 0.4).toFixed(1)));
    copy.combatStyle = 'agile';
  }
  if (ins.includes('stronger') || ins.includes('power') || ins.includes('heavy')) {
    copy.stats.power = Math.min(1.15, Number((copy.stats.power + 0.08).toFixed(2)));
    copy.appearance.silhouetteSize = 'heavy';
  }
  if (ins.includes('defense') || ins.includes('armor') || ins.includes('shield')) {
    copy.stats.defense = Math.min(1.15, Number((copy.stats.defense + 0.08).toFixed(2)));
    copy.combatStyle = 'defensive';
  }
  if (ins.includes('ice') || ins.includes('frost')) {
    copy.appearance.visualEffects = ['frost_shards'];
    copy.specialMove.mechanic = 'projectile_blast';
    copy.specialMove.name = 'Glacial Spire';
    copy.specialMove.description = 'Hurls a frozen crystal projectile that detonates on impact.';
  }
  if (ins.includes('lightning') || ins.includes('electric') || ins.includes('thunder')) {
    copy.appearance.visualEffects = ['electric_arcs'];
    copy.specialMove.mechanic = 'teleport_strike';
    copy.specialMove.name = 'Volt Severance';
    copy.specialMove.description = 'Warps through lightning behind target to slash with high voltage.';
  }
  if (ins.includes('fire') || ins.includes('flame') || ins.includes('lava')) {
    copy.appearance.visualEffects = ['fire_trails'];
    copy.specialMove.name = 'Infernal Eruption';
    copy.specialMove.description = 'Unleashes a surge of molten flames.';
  }
  if (ins.includes('wings') || ins.includes('dragon') || ins.includes('fly')) {
    copy.appearance.capeOrWings = true;
  }

  copy.description = `${copy.description} [Customized: "${instruction.slice(0, 40)}"]`;
  return copy;
}

