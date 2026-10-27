export type VisualArchetype =
  | 'cyber_samurai'
  | 'elemental_mage'
  | 'robot_monk'
  | 'brawler_beast'
  | 'cosmic_entity'
  | 'shadow_assassin'
  | 'food_brawler'
  | 'armored_titan'
  | 'bio_mutant'
  | 'energy_specter';

export type VisualEffectType =
  | 'electric_arcs'
  | 'fire_trails'
  | 'frost_shards'
  | 'dark_void'
  | 'plasma_glow'
  | 'sacred_light'
  | 'gravity_rings'
  | 'bio_spores';

export type WeaponType =
  | 'katana'
  | 'energy_blades'
  | 'power_fists'
  | 'mystic_staff'
  | 'shadow_daggers'
  | 'cosmic_orb'
  | 'heavy_cleaver'
  | 'unarmed';

export type CombatStyle = 'agile' | 'brawler' | 'balanced' | 'defensive' | 'tactical' | 'rushdown';

export type SpecialMechanic =
  | 'teleport_strike'
  | 'projectile_blast'
  | 'energy_barrier'
  | 'ground_slam'
  | 'vampiric_drain'
  | 'frenzy_roll'
  | 'counter_stance'
  | 'lightning_storm';

export type PassiveMechanic =
  | 'low_hp_rage'
  | 'energy_on_block'
  | 'speed_boost'
  | 'counter_damage'
  | 'frost_slow'
  | 'gravity_pulse'
  | 'static_charge'
  | 'healing_surge';

export type WeaknessMechanic =
  | 'heavy_damage_vulnerable'
  | 'slow_recovery'
  | 'energy_drain_on_miss'
  | 'fragile_guard'
  | 'low_anti_air'
  | 'self_damage_on_ultimate';

export interface FighterAppearance {
  archetype: VisualArchetype;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
  armorStyle: string;
  weaponType: WeaponType;
  visualEffects: VisualEffectType[];
  silhouetteSize: 'compact' | 'medium' | 'heavy' | 'towering';
  headgear?: string;
  capeOrWings?: boolean;
}

export interface FighterStats {
  maxHealth: number;    // 90 - 130 (Balanced around 100)
  speed: number;        // 4 - 8 (Base movement velocity)
  power: number;        // 0.8 - 1.4 (Damage multiplier)
  defense: number;      // 0.8 - 1.3 (Damage reduction multiplier)
  energyRegen: number;  // 0.8 - 1.5 (Energy regen rate per second)
  jumpForce: number;    // 12 - 16 (Jump impulse)
}

export interface FighterAbility {
  name: string;
  description: string;
  damage: number;
  energyCost: number;
  cooldown: number; // in seconds
  mechanic: SpecialMechanic;
}

export interface FighterPassive {
  name: string;
  description: string;
  mechanic: PassiveMechanic;
  statBonus?: string;
}

export interface FighterWeakness {
  name: string;
  description: string;
  mechanic: WeaknessMechanic;
  counterplayTip: string;
}

export interface FighterPersonality {
  trait: string;
  voiceTone: string;
  introDialogue: string;
  victoryDialogue: string;
  defeatDialogue: string;
}

export interface FighterDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  creatorPrompt?: string;
  isCustom?: boolean;
  modelGenerated?: boolean;
  generatorEngine?: string; // e.g. "Google Gemma / Gemini 3.8" or "Procedural Engine"
  combatStyle: CombatStyle;
  appearance: FighterAppearance;
  stats: FighterStats;
  primaryAttack: {
    name: string;
    damage: number;
    range: number;
  };
  specialMove: FighterAbility;
  passiveAbility: FighterPassive;
  weakness: FighterWeakness;
  personality: FighterPersonality;
  createdAt?: number;
  evolutionHistory?: string[];
}

export type FighterActionState =
  | 'idle'
  | 'walk_forward'
  | 'walk_back'
  | 'jump'
  | 'punch'
  | 'kick'
  | 'special'
  | 'block'
  | 'hit'
  | 'ko'
  | 'victory'
  | 'taunt';

export interface HitBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AttackBox extends HitBox {
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitType: 'light' | 'heavy' | 'special';
  element?: string;
}

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  damage: number;
  color: string;
  effect: VisualEffectType;
  duration: number;
}

export interface CombatFighterState {
  definition: FighterDefinition;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1; // 1 = facing right, -1 = facing left
  isGrounded: boolean;
  actionState: FighterActionState;
  stateTimer: number; // in seconds
  stateDuration: number;
  currentHealth: number;
  currentEnergy: number;
  comboCount: number;
  comboTimer: number;
  specialCooldown: number;
  isBlocking: boolean;
  blockDuration: number; // Duration of active continuous block (max 5.0 seconds)
  blockCooldown: number; // Cooldown after guard break or block release
  isInvulnerable: boolean;
  invulnerableTimer: number;
  passiveTriggered: boolean;
  score: number;
  roundsWon: number;
}

export interface MatchTelemetry {
  playerDamageDealt: number;
  opponentDamageDealt: number;
  playerCombosMax: number;
  playerJumps: number;
  playerBlocks: number;
  playerSpecialsUsed: number;
  opponentSpecialsUsed: number;
  matchDurationSeconds: number;
  currentRound: number;
  winner?: 'p1' | 'cpu' | 'draw';
}

export interface ReplayFighterSnapshot {
  x: number;
  y: number;
  facing: 1 | -1;
  actionState: FighterActionState;
  health: number;
  energy: number;
  isBlocking: boolean;
  blockDuration: number;
}

export interface ReplayFrame {
  timestamp: number;
  p1: ReplayFighterSnapshot;
  cpu: ReplayFighterSnapshot;
  projectiles: Array<{ x: number; y: number; color: string; width: number; height: number }>;
  particles: Array<{ x: number; y: number; color: string; size: number; type: string }>;
  floatingTexts?: Array<{ text: string; x: number; y: number; color: string }>;
  screenShake: number;
  eventHighlight?: {
    type: 'hit' | 'special' | 'guard_break' | 'ko' | 'combo';
    label: string;
  };
}

export interface CombatEvent {
  id: string;
  type: 'punch' | 'kick' | 'special' | 'block' | 'guard_break' | 'hit' | 'combo' | 'low_hp' | 'ko' | 'round_start';
  actorName: string;
  targetName?: string;
  moveName?: string;
  details?: string;
  damage?: number;
  comboCount?: number;
  commentaryText: string;
  timestamp: number;
}
