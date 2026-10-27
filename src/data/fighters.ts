import { FighterDefinition } from '../types/fighter';

export const PRESET_FIGHTERS: FighterDefinition[] = [
  {
    id: 'volt_ronin',
    name: 'Volt Ronin',
    title: 'The Stormbound Samurai',
    description: 'A cybernetic warrior forged in the high-voltage neon spires, channeling unstable lightning through high-frequency plasma blades.',
    creatorPrompt: 'A samurai made of living electricity who teleports behind enemies and releases lightning slashes.',
    isCustom: false,
    combatStyle: 'agile',
    appearance: {
      archetype: 'cyber_samurai',
      primaryColor: '#06b6d4',
      secondaryColor: '#8b5cf6',
      accentColor: '#38bdf8',
      glowColor: '#00f0ff',
      armorStyle: 'Nanotech Samurai Plating',
      weaponType: 'katana',
      visualEffects: ['electric_arcs'],
      silhouetteSize: 'medium',
      capeOrWings: true
    },
    stats: {
      maxHealth: 100,
      speed: 6.8,
      power: 1.15,
      defense: 0.95,
      energyRegen: 1.2,
      jumpForce: 14.5
    },
    primaryAttack: {
      name: 'Thunder Edge',
      damage: 10,
      range: 85
    },
    specialMove: {
      name: 'Thunderstep Slash',
      description: 'Teleports behind the opponent and delivers an electric severance strike.',
      damage: 24,
      energyCost: 35,
      cooldown: 3.5,
      mechanic: 'teleport_strike'
    },
    passiveAbility: {
      name: 'Static Charge',
      description: 'Continuous movement builds static electricity, boosting movement speed by 20%.',
      mechanic: 'static_charge',
      statBonus: '+20% Speed on move'
    },
    weakness: {
      name: 'Overcharged Recovery',
      description: 'Suffers 0.4s additional recovery lag after executing a special teleport strike.',
      mechanic: 'slow_recovery',
      counterplayTip: 'Block the teleport and punish during the blade recovery window.'
    },
    personality: {
      trait: 'Disciplined & Relentless',
      voiceTone: 'Calm and crackling with static energy',
      introDialogue: 'The storm does not apologize for where it strikes.',
      victoryDialogue: 'A blade faster than thunder needs no second stroke.',
      defeatDialogue: 'My voltage... drops...'
    }
  },
  {
    id: 'samosa_prime',
    name: 'Samosa Prime',
    title: 'The Spiced Juggernaut',
    description: 'A colossal pastry golem infused with primordial chutney magma and crispy golden armor that hardens under extreme heat.',
    creatorPrompt: 'A furious samosa monster that rolls across the arena, launches spicy lava, and becomes stronger when its health is low.',
    isCustom: false,
    combatStyle: 'brawler',
    appearance: {
      archetype: 'food_brawler',
      primaryColor: '#f59e0b',
      secondaryColor: '#ef4444',
      accentColor: '#fbbf24',
      glowColor: '#f97316',
      armorStyle: 'Deep-Fried Golden Crust',
      weaponType: 'power_fists',
      visualEffects: ['fire_trails'],
      silhouetteSize: 'heavy',
      capeOrWings: false
    },
    stats: {
      maxHealth: 120,
      speed: 4.8,
      power: 1.25,
      defense: 1.15,
      energyRegen: 0.9,
      jumpForce: 13.0
    },
    primaryAttack: {
      name: 'Pastry Pummel',
      damage: 13,
      range: 75
    },
    specialMove: {
      name: 'Masala Steamroll',
      description: 'Tucks into a boiling golden sphere and rolls across the floor crushing all in its path.',
      damage: 28,
      energyCost: 40,
      cooldown: 4.0,
      mechanic: 'frenzy_roll'
    },
    passiveAbility: {
      name: 'Scorching Spices',
      description: 'When below 35% health, boiling chutney activates: damage dealt increases by 30%.',
      mechanic: 'low_hp_rage',
      statBonus: '+30% Attack at low HP'
    },
    weakness: {
      name: 'Heavy Pastry Mass',
      description: 'Slower movement and larger hurtbox makes dodging projectiles difficult.',
      mechanic: 'heavy_damage_vulnerable',
      counterplayTip: 'Keep your distance and poke with fast ranged strikes.'
    },
    personality: {
      trait: 'Boiling with righteous culinary fury',
      voiceTone: 'Sizzling, boisterous, and piping hot',
      introDialogue: 'Fresh from the fire! Prepare to get crushed!',
      victoryDialogue: 'Extra crispy, never soggy. Bested by flavor!',
      defeatDialogue: 'The crust... cracks...'
    }
  },
  {
    id: 'zenith_9',
    name: 'Zenith-9',
    title: 'The Iron Ascetic',
    description: 'An ancient sentient chassis rebuilt by mountain cyber-monks, transmuting received kinetic impacts into radiant kinetic mantras.',
    creatorPrompt: 'A robot monk who absorbs energy when blocking and unleashes a devastating counterattack.',
    isCustom: false,
    combatStyle: 'defensive',
    appearance: {
      archetype: 'robot_monk',
      primaryColor: '#10b981',
      secondaryColor: '#d97706',
      accentColor: '#34d399',
      glowColor: '#10b981',
      armorStyle: 'Titanium Prayer Plates',
      weaponType: 'mystic_staff',
      visualEffects: ['sacred_light'],
      silhouetteSize: 'medium',
      headgear: 'Halo Sensor Ring'
    },
    stats: {
      maxHealth: 105,
      speed: 5.5,
      power: 1.0,
      defense: 1.25,
      energyRegen: 1.0,
      jumpForce: 14.0
    },
    primaryAttack: {
      name: 'Lotus Palm',
      damage: 9,
      range: 80
    },
    specialMove: {
      name: 'Mantra Repulsion',
      description: 'Converts stored energy into a kinetic blast wave radiating outward.',
      damage: 25,
      energyCost: 30,
      cooldown: 3.0,
      mechanic: 'counter_stance'
    },
    passiveAbility: {
      name: 'Kinetic Absorption',
      description: 'Successfully blocking enemy attacks replenishes 15 energy points.',
      mechanic: 'energy_on_block',
      statBonus: '+15 Energy on Block'
    },
    weakness: {
      name: 'Stationary Meditation',
      description: 'Relies heavily on guard stance; susceptible to low attacks and pressure combos.',
      mechanic: 'fragile_guard',
      counterplayTip: 'Use continuous pressure combos to chip through its energy reserves.'
    },
    personality: {
      trait: 'Serene, analytical, and unbreakable',
      voiceTone: 'Resonant harmonic synthesizer',
      introDialogue: 'Violence is merely energy seeking equilibrium. Proceed.',
      victoryDialogue: 'Your momentum was returned in full measure.',
      defeatDialogue: 'Returning to core meditation...'
    }
  },
  {
    id: 'nyx_shadowthorn',
    name: 'Nyx Shadowthorn',
    title: 'The Void Assassin',
    description: 'An ethereal assassin woven from the void between stars, phasing through matter and striking with shadow-infused daggers.',
    creatorPrompt: 'A shadow assassin who slips through space and strikes with dark tendrils.',
    isCustom: false,
    combatStyle: 'rushdown',
    appearance: {
      archetype: 'shadow_assassin',
      primaryColor: '#8b5cf6',
      secondaryColor: '#0f172a',
      accentColor: '#c084fc',
      glowColor: '#a855f7',
      armorStyle: 'Nightveil Cloak',
      weaponType: 'shadow_daggers',
      visualEffects: ['dark_void'],
      silhouetteSize: 'compact',
      capeOrWings: true
    },
    stats: {
      maxHealth: 92,
      speed: 7.2,
      power: 1.3,
      defense: 0.85,
      energyRegen: 1.3,
      jumpForce: 15.5
    },
    primaryAttack: {
      name: 'Umbral Fang',
      damage: 11,
      range: 75
    },
    specialMove: {
      name: 'Eclipse Rift',
      description: 'Disappears into the shadow dimension and erupts under the opponent with dark tendrils.',
      damage: 26,
      energyCost: 35,
      cooldown: 3.5,
      mechanic: 'teleport_strike'
    },
    passiveAbility: {
      name: 'Shadow Speed',
      description: 'Attains 15% bonus movement speed and instant dash agility.',
      mechanic: 'speed_boost',
      statBonus: '+15% Move Speed'
    },
    weakness: {
      name: 'Glass Blade',
      description: 'Fragile constitution; takes 15% increased damage from heavy attacks.',
      mechanic: 'heavy_damage_vulnerable',
      counterplayTip: 'Land heavy kicks or counter attacks when she closes in.'
    },
    personality: {
      trait: 'Cold, whispering, and lethal',
      voiceTone: 'Silvery, shadowy whisper',
      introDialogue: 'You cannot strike what has already consumed you.',
      victoryDialogue: 'Darkness welcomes another lost silhouette.',
      defeatDialogue: 'The shadows... unravel...'
    }
  },
  {
    id: 'astraea_cosmic',
    name: 'Astraea',
    title: 'The Gravity Weaver',
    description: 'A stellar entity manifested from a dying nebula, bending localized gravitational fields and hurling starlight pulses.',
    creatorPrompt: 'A tiny cosmic dragon that controls gravity but becomes vulnerable after using its ultimate ability.',
    isCustom: false,
    combatStyle: 'tactical',
    appearance: {
      archetype: 'cosmic_entity',
      primaryColor: '#3b82f6',
      secondaryColor: '#ec4899',
      accentColor: '#60a5fa',
      glowColor: '#38bdf8',
      armorStyle: 'Astral Corona Shroud',
      weaponType: 'cosmic_orb',
      visualEffects: ['gravity_rings', 'plasma_glow'],
      silhouetteSize: 'compact',
      capeOrWings: true
    },
    stats: {
      maxHealth: 95,
      speed: 6.2,
      power: 1.2,
      defense: 0.9,
      energyRegen: 1.4,
      jumpForce: 16.0
    },
    primaryAttack: {
      name: 'Pulsar Beam',
      damage: 10,
      range: 110
    },
    specialMove: {
      name: 'Singularity Burst',
      description: 'Fires a concentrated gravity orb that detonates across half the arena.',
      damage: 27,
      energyCost: 40,
      cooldown: 4.5,
      mechanic: 'projectile_blast'
    },
    passiveAbility: {
      name: 'Gravity Well',
      description: 'Alters gravitational pull around self, granting high jump height and float control.',
      mechanic: 'gravity_pulse',
      statBonus: 'Low-gravity float & jump'
    },
    weakness: {
      name: 'Cosmic Dissipation',
      description: 'Loses 10 energy if the special projectile misses the target entirely.',
      mechanic: 'energy_drain_on_miss',
      counterplayTip: 'Jump over the singularity orb to deplete Astraea\'s reserves.'
    },
    personality: {
      trait: 'Enigmatic, regal, and curious',
      voiceTone: 'Ethereal celestial chime',
      introDialogue: 'Let the weight of galaxies judge your spirit.',
      victoryDialogue: 'Even stars must bow before gravitational law.',
      defeatDialogue: 'Returning to the stardust...'
    }
  }
];

const LOCAL_STORAGE_KEY = 'fight_mind_custom_fighters_v1';

export function getCustomFighters(): FighterDefinition[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(f => f && f.id && f.name);
    }
    return [];
  } catch (err) {
    console.error('Failed to load custom fighters from storage:', err);
    return [];
  }
}

export function saveCustomFighter(fighter: FighterDefinition): void {
  try {
    const existing = getCustomFighters();
    const index = existing.findIndex(f => f.id === fighter.id);
    fighter.isCustom = true;
    fighter.createdAt = fighter.createdAt || Date.now();
    
    if (index >= 0) {
      existing[index] = fighter;
    } else {
      existing.unshift(fighter);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save custom fighter:', err);
  }
}

export function deleteCustomFighter(fighterId: string): void {
  try {
    const existing = getCustomFighters();
    const filtered = existing.filter(f => f.id !== fighterId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete custom fighter:', err);
  }
}

export function getAllFighters(): FighterDefinition[] {
  return [...getCustomFighters(), ...PRESET_FIGHTERS];
}
