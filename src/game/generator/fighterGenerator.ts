import {
  FighterDefinition,
  VisualArchetype,
  WeaponType,
  SpecialMechanic,
  PassiveMechanic,
  WeaknessMechanic,
  CombatStyle,
  VisualEffectType
} from '../../types/fighter';

export interface PromptAnalysis {
  matchedKeywords: string[];
  archetype: VisualArchetype;
  weaponType: WeaponType;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  accentColor: string;
  visualEffects: VisualEffectType[];
  specialMechanic: SpecialMechanic;
  passiveMechanic: PassiveMechanic;
  weaknessMechanic: WeaknessMechanic;
  combatStyle: CombatStyle;
  silhouetteSize: 'compact' | 'medium' | 'heavy' | 'towering';
  hasCapeOrWings: boolean;
  heroName: string;
  title: string;
  specialMoveName: string;
  specialMoveDesc: string;
  passiveName: string;
  passiveDesc: string;
}

/**
 * Analyzes natural language prompt and produces rich thematic styling and balanced stats
 */
export function analyzePrompt(prompt: string, archetypeHint?: string): PromptAnalysis {
  const p = prompt.toLowerCase();
  const matchedKeywords: string[] = [];

  // 1. Archetype Detection
  let archetype: VisualArchetype = 'cyber_samurai';
  if (p.match(/samosa|food|donut|pizza|burger|taco|chef|kitchen|snack|cook|bakery|bread/)) {
    archetype = 'food_brawler';
    matchedKeywords.push('food');
  } else if (p.match(/monk|buddha|zen|temple|priest|spiritual|meditat|shrine/)) {
    archetype = 'robot_monk';
    matchedKeywords.push('monk');
  } else if (p.match(/cosmic|dragon|star|galaxy|void|nebula|astro|space|black hole|gravity|orbit/)) {
    archetype = 'cosmic_entity';
    matchedKeywords.push('cosmic');
  } else if (p.match(/shadow|ninja|assassin|stealth|rogue|phantom|ghost|specter|shinobi|darkness/)) {
    archetype = 'shadow_assassin';
    matchedKeywords.push('shadow');
  } else if (p.match(/titan|golem|iron|colossus|giant|mech|armor|armoured|steel|juggernaut/)) {
    archetype = 'armored_titan';
    matchedKeywords.push('titan');
  } else if (p.match(/mutant|venom|poison|spider|acid|toxic|bio|slime|beast|animal|insect|wolf|bear/)) {
    archetype = 'bio_mutant';
    matchedKeywords.push('mutant');
  } else if (p.match(/specter|ghost|energy|phantom|spirit|aura|wraith/)) {
    archetype = 'energy_specter';
    matchedKeywords.push('specter');
  } else if (p.match(/mage|wizard|witch|sorcerer|elemental|magic|spell|arcane/)) {
    archetype = 'elemental_mage';
    matchedKeywords.push('mage');
  } else if (p.match(/brawler|boxer|wrestler|puncher|fighter|slugger/)) {
    archetype = 'brawler_beast';
    matchedKeywords.push('brawler');
  }

  if (archetypeHint) {
    archetype = archetypeHint as VisualArchetype;
  }

  // 2. Color Detection
  let primaryColor = '#06b6d4'; // default cyan
  let secondaryColor = '#3b82f6';
  let glowColor = '#00f0ff';
  let accentColor = '#38bdf8';

  if (p.match(/gold|yellow|solar|sun|radiant|amber/)) {
    primaryColor = '#f59e0b';
    secondaryColor = '#d97706';
    glowColor = '#fbbf24';
    accentColor = '#fef08a';
    matchedKeywords.push('gold');
  } else if (p.match(/red|crimson|blood|scarlet|ruby/)) {
    primaryColor = '#ef4444';
    secondaryColor = '#991b1b';
    glowColor = '#f87171';
    accentColor = '#fca5a5';
    matchedKeywords.push('red');
  } else if (p.match(/fire|flame|lava|magma|blaze|inferno|burn/)) {
    primaryColor = '#f97316';
    secondaryColor = '#b91c1c';
    glowColor = '#ff6b35';
    accentColor = '#fde047';
    matchedKeywords.push('fire');
  } else if (p.match(/ice|frost|cold|freeze|glacial|snow|penguin|blizzard/)) {
    primaryColor = '#38bdf8';
    secondaryColor = '#0284c7';
    glowColor = '#67e8f9';
    accentColor = '#e0f2fe';
    matchedKeywords.push('ice');
  } else if (p.match(/electric|lightning|thunder|volt|shock|storm/)) {
    primaryColor = '#eab308';
    secondaryColor = '#06b6d4';
    glowColor = '#38bdf8';
    accentColor = '#fef08a';
    matchedKeywords.push('electric');
  } else if (p.match(/green|emerald|toxic|acid|poison|venom|forest|nature/)) {
    primaryColor = '#10b981';
    secondaryColor = '#065f46';
    glowColor = '#34d399';
    accentColor = '#a7f3d0';
    matchedKeywords.push('green');
  } else if (p.match(/purple|violet|amethyst|psychic|void|abyss/)) {
    primaryColor = '#a855f7';
    secondaryColor = '#581c87';
    glowColor = '#c084fc';
    accentColor = '#e9d5ff';
    matchedKeywords.push('purple');
  } else if (p.match(/pink|magenta|neon|rose|sakura/)) {
    primaryColor = '#ec4899';
    secondaryColor = '#831843';
    glowColor = '#f472b6';
    accentColor = '#fbcfe8';
    matchedKeywords.push('pink');
  } else if (p.match(/black|dark|shadow|onyx|obsidian|midnight/)) {
    primaryColor = '#334155';
    secondaryColor = '#090d16';
    glowColor = '#64748b';
    accentColor = '#00f0ff';
    matchedKeywords.push('dark');
  } else if (p.match(/white|silver|platinum|celestial|holy|sacred/)) {
    primaryColor = '#f8fafc';
    secondaryColor = '#64748b';
    glowColor = '#e2e8f0';
    accentColor = '#38bdf8';
    matchedKeywords.push('white');
  }

  // 3. Weapon Detection
  let weaponType: WeaponType = 'katana';
  if (p.match(/fist|punch|glove|gauntlet|brass|hand/)) {
    weaponType = 'power_fists';
    matchedKeywords.push('fists');
  } else if (p.match(/staff|rod|pole|spear|stick/)) {
    weaponType = 'mystic_staff';
    matchedKeywords.push('staff');
  } else if (p.match(/dagger|knife|kunai|blade|claw|razor/)) {
    weaponType = 'shadow_daggers';
    matchedKeywords.push('daggers');
  } else if (p.match(/orb|sphere|crystal|relic|ball/)) {
    weaponType = 'cosmic_orb';
    matchedKeywords.push('orb');
  } else if (p.match(/dual|twin|energy blade|saber|lightsaber/)) {
    weaponType = 'energy_blades';
    matchedKeywords.push('energy blades');
  } else if (p.match(/axe|cleaver|hammer|mace|heavy sword/)) {
    weaponType = 'heavy_cleaver';
    matchedKeywords.push('cleaver');
  } else if (p.match(/kick|unarmed|wrestl|bare/)) {
    weaponType = 'unarmed';
    matchedKeywords.push('unarmed');
  }

  // 4. Visual Effects
  const visualEffects: VisualEffectType[] = [];
  if (p.match(/electric|lightning|thunder|volt|shock|spark/)) visualEffects.push('electric_arcs');
  if (p.match(/fire|flame|lava|magma|blaze|inferno/)) visualEffects.push('fire_trails');
  if (p.match(/ice|frost|cold|freeze|glacial|snow/)) visualEffects.push('frost_shards');
  if (p.match(/dark|shadow|void|abyss|nightmare|black/)) visualEffects.push('dark_void');
  if (p.match(/plasma|neon|laser|glow|cyber|futur/)) visualEffects.push('plasma_glow');
  if (p.match(/holy|sacred|light|divine|angel|radiant/)) visualEffects.push('sacred_light');
  if (p.match(/gravity|space|cosmic|orbit|ring/)) visualEffects.push('gravity_rings');
  if (p.match(/poison|toxic|acid|bio|spore|venom/)) visualEffects.push('bio_spores');
  if (visualEffects.length === 0) visualEffects.push('plasma_glow');

  // 5. Special Mechanics & Abilities
  let specialMechanic: SpecialMechanic = 'teleport_strike';
  let specialMoveName = 'Flash Strike';
  let specialMoveDesc = 'Vanishes into thin air and delivers a surprise strike.';

  if (p.match(/teleport|behind|blink|warp|shadow step/)) {
    specialMechanic = 'teleport_strike';
    specialMoveName = 'Warp Cleave';
    specialMoveDesc = 'Blinks instantly behind the opponent to strike from their blind spot.';
    matchedKeywords.push('teleport');
  } else if (p.match(/projectile|shoot|blast|fireball|laser|bomb|throw|fish|ice wall|missile|beam/)) {
    specialMechanic = 'projectile_blast';
    specialMoveName = p.match(/fish/) ? 'Frozen Fish Barrage' : (p.match(/lava/) ? 'Molten Core Eruption' : 'Aether Blast');
    specialMoveDesc = 'Launches a high-velocity piercing projectile across the arena.';
    matchedKeywords.push('projectile');
  } else if (p.match(/roll|spin|tumble|frenzy|wheel/)) {
    specialMechanic = 'frenzy_roll';
    specialMoveName = p.match(/samosa/) ? 'Spicy Crust Avalanche' : 'Cyclone Rush';
    specialMoveDesc = 'Tucks into a kinetic spin and crashes through enemy defenses.';
    matchedKeywords.push('roll');
  } else if (p.match(/counter|absorb|parry|reflect|deflect|block/)) {
    specialMechanic = 'counter_stance';
    specialMoveName = 'Iron Reflection';
    specialMoveDesc = 'Braces against incoming impact and unleashes kinetic backlash.';
    matchedKeywords.push('counter');
  } else if (p.match(/slam|smash|earthquake|ground|stomp/)) {
    specialMechanic = 'ground_slam';
    specialMoveName = 'Tremor Cataclysm';
    specialMoveDesc = 'Strikes the ground to erupt a shockwave that destabilizes the foe.';
    matchedKeywords.push('slam');
  } else if (p.match(/drain|vampire|leech|siphon|blood|life/)) {
    specialMechanic = 'vampiric_drain';
    specialMoveName = 'Soul Siphon';
    specialMoveDesc = 'Channels dark essence to leach health from the opponent.';
    matchedKeywords.push('drain');
  } else if (p.match(/lightning storm|tempest|thunder/)) {
    specialMechanic = 'lightning_storm';
    specialMoveName = 'Thunder Reign';
    specialMoveDesc = 'Calls down an electric vortex that blankets the combat zone.';
    matchedKeywords.push('storm');
  }

  // 6. Passive Ability
  let passiveMechanic: PassiveMechanic = 'speed_boost';
  let passiveName = 'Kinetic Acceleration';
  let passiveDesc = 'Maintains fluid movement acceleration in battle.';

  if (p.match(/low health|rage|weaker|desperation|danger/)) {
    passiveMechanic = 'low_hp_rage';
    passiveName = 'Crisis Fury';
    passiveDesc = '+30% attack power when health drops below 35%.';
  } else if (p.match(/absorb|energy.*block|guard.*energy|monk/)) {
    passiveMechanic = 'energy_on_block';
    passiveName = 'Harmonic Absorption';
    passiveDesc = 'Generates 15 energy whenever an attack is successfully blocked.';
  } else if (p.match(/freeze|frost|slow|chill/)) {
    passiveMechanic = 'frost_slow';
    passiveName = 'Glacial Field';
    passiveDesc = 'Strikes briefly slow down opponent mobility.';
  } else if (p.match(/gravity|pull|push|pulse/)) {
    passiveMechanic = 'gravity_pulse';
    passiveName = 'Graviton Well';
    passiveDesc = 'Emits subtle gravity ripples during aerial movements.';
  } else if (p.match(/static|electric|charge|run/)) {
    passiveMechanic = 'static_charge';
    passiveName = 'Electrostatic Accumulator';
    passiveDesc = 'Builds kinetic speed while continuously moving.';
  }

  // 7. Weakness
  let weaknessMechanic: WeaknessMechanic = 'slow_recovery';
  if (p.match(/vulnerable.*ultimate|fragile|glass|shatter/)) {
    weaknessMechanic = 'heavy_damage_vulnerable';
  } else if (p.match(/anti air|jump/)) {
    weaknessMechanic = 'low_anti_air';
  }

  // 8. Style & Silhouette
  let combatStyle: CombatStyle = 'balanced';
  let silhouetteSize: 'compact' | 'medium' | 'heavy' | 'towering' = 'medium';

  if (p.match(/tiny|small|penguin|mini|compact|swift/)) {
    combatStyle = 'agile';
    silhouetteSize = 'compact';
  } else if (p.match(/heavy|huge|giant|monster|golem|titan|tank|colossus/)) {
    combatStyle = 'brawler';
    silhouetteSize = 'heavy';
  } else if (p.match(/defense|shield|guard|turtle|monk/)) {
    combatStyle = 'defensive';
  } else if (p.match(/rush|fast|aggressive|assassin/)) {
    combatStyle = 'rushdown';
  }

  const hasCapeOrWings = Boolean(p.match(/wing|cape|cloak|dragon|angel|bat|fly/));

  // 9. Naming
  const cleanWords = prompt
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 2 && !['the', 'and', 'with', 'that', 'who', 'for', 'from'].includes(w.toLowerCase()));

  const mainNoun = cleanWords[0] ? cleanWords[0].charAt(0).toUpperCase() + cleanWords[0].slice(1).toLowerCase() : 'Vanguard';
  const secondNoun = cleanWords[1] ? cleanWords[1].charAt(0).toUpperCase() + cleanWords[1].slice(1).toLowerCase() : '';

  let heroName = secondNoun ? `${mainNoun} ${secondNoun}` : `${mainNoun} Prime`;
  if (p.includes('samosa')) heroName = 'Volcano Samosa';
  else if (p.includes('penguin')) heroName = 'Penguin Shinobi';
  else if (p.includes('samurai') && p.includes('electricity')) heroName = 'Volt Raiden';
  else if (p.includes('monk') && p.includes('robot')) heroName = 'Zenith-09';
  else if (p.includes('dragon') && p.includes('cosmic')) heroName = 'Graviton Wyrm';

  const title = `The Manifested ${mainNoun}`;

  return {
    matchedKeywords,
    archetype,
    weaponType,
    primaryColor,
    secondaryColor,
    glowColor,
    accentColor,
    visualEffects,
    specialMechanic,
    passiveMechanic,
    weaknessMechanic,
    combatStyle,
    silhouetteSize,
    hasCapeOrWings,
    heroName,
    title,
    specialMoveName,
    specialMoveDesc,
    passiveName,
    passiveDesc,
  };
}

/**
 * Creates a tournament-balanced fighter definition from the prompt analysis
 */
export function buildFighterFromPrompt(prompt: string, archetypeHint?: string): FighterDefinition {
  const analysis = analyzePrompt(prompt, archetypeHint);

  // STRICT TOURNAMENT BALANCE STAT BUDGET (Medium difficulty / fair play)
  // No stat is allowed to exceed fair thresholds
  let maxHealth = 100;
  let speed = 5.8;
  let power = 1.05;
  let defense = 1.0;
  let energyRegen = 1.15;
  let jumpForce = 14.2;

  if (analysis.combatStyle === 'brawler') {
    maxHealth = 106;
    speed = 5.2;
    power = 1.12;
    defense = 1.08;
    jumpForce = 13.8;
  } else if (analysis.combatStyle === 'agile' || analysis.combatStyle === 'rushdown') {
    maxHealth = 96;
    speed = 6.3;
    power = 1.02;
    defense = 0.95;
    jumpForce = 14.8;
  } else if (analysis.combatStyle === 'defensive') {
    maxHealth = 104;
    speed = 5.4;
    power = 0.98;
    defense = 1.12;
    energyRegen = 1.25;
  }

  const primaryDamage = analysis.combatStyle === 'brawler' ? 12 : (analysis.combatStyle === 'agile' ? 9 : 10);
  const specialDamage = analysis.combatStyle === 'brawler' ? 27 : 25;

  return {
    id: 'f_' + Math.random().toString(36).substring(2, 9),
    name: analysis.heroName,
    title: analysis.title,
    description: `Conjured from imagination: "${prompt.slice(0, 120)}"`,
    creatorPrompt: prompt,
    isCustom: true,
    modelGenerated: true,
    generatorEngine: 'FIGHT//MIND Neural Engine',
    combatStyle: analysis.combatStyle,
    appearance: {
      archetype: analysis.archetype,
      primaryColor: analysis.primaryColor,
      secondaryColor: analysis.secondaryColor,
      accentColor: analysis.accentColor,
      glowColor: analysis.glowColor,
      armorStyle: `${analysis.archetype.replace('_', ' ')} armor`,
      weaponType: analysis.weaponType,
      visualEffects: analysis.visualEffects,
      silhouetteSize: analysis.silhouetteSize,
      capeOrWings: analysis.hasCapeOrWings
    },
    stats: {
      maxHealth,
      speed,
      power,
      defense,
      energyRegen,
      jumpForce
    },
    primaryAttack: {
      name: `${analysis.heroName.split(' ')[0]} Strike`,
      damage: primaryDamage,
      range: 80
    },
    specialMove: {
      name: analysis.specialMoveName,
      description: analysis.specialMoveDesc,
      damage: specialDamage,
      energyCost: 35,
      cooldown: 3.5,
      mechanic: analysis.specialMechanic
    },
    passiveAbility: {
      name: analysis.passiveName,
      description: analysis.passiveDesc,
      mechanic: analysis.passiveMechanic,
      statBonus: analysis.combatStyle === 'brawler' ? '+15% Heavy Impact' : '+15% Flow State'
    },
    weakness: {
      name: 'Recovery Window',
      description: 'Brief recovery cooldown after heavy actions leaves a counterplay opening.',
      mechanic: analysis.weaknessMechanic,
      counterplayTip: 'Wait for their big swing or special recovery, then counter-attack.'
    },
    personality: {
      trait: 'Distinctive & Resolute',
      voiceTone: 'Clear and dynamic',
      introDialogue: 'You will witness the power of imagination made flesh.',
      victoryDialogue: 'As it was conceived, so shall it stand victorious.',
      defeatDialogue: 'My thought form will reconstruct...'
    },
    createdAt: Date.now()
  };
}
