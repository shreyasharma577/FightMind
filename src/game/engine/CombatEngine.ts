import {
  CombatFighterState,
  FighterDefinition,
  AttackBox,
  HitBox,
  Projectile,
  MatchTelemetry,
  ReplayFrame,
  ReplayFighterSnapshot,
  CombatEvent
} from '../../types/fighter';
import { soundManager } from '../../audio/soundManager';

export interface CombatParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'slash' | 'ring' | 'block';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  scale: number;
}

export interface CombatEngineConfig {
  trainingMode?: boolean;
  aiDifficulty?: 'normal' | 'hard' | 'adaptive';
  onRoundEnd?: (winner: 'p1' | 'cpu' | 'draw') => void;
  onMatchEnd?: (winner: 'p1' | 'cpu', telemetry: MatchTelemetry, replayFrames: ReplayFrame[]) => void;
  onCombatEvent?: (event: CombatEvent) => void;
}

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 540;
export const GROUND_Y = 460;
export const GRAVITY = 32;
export const MAX_BLOCK_DURATION = 5.0; // Maximum continuous shield hold in seconds

export class CombatEngine {
  public p1: CombatFighterState;
  public cpu: CombatFighterState;
  public projectiles: Projectile[] = [];
  public particles: CombatParticle[] = [];
  public floatingTexts: FloatingText[] = [];

  public roundTimer: number = 99;
  public currentRound: number = 1;
  public maxRounds: number = 3;
  public roundState: 'intro' | 'fight' | 'round_over' | 'match_over' = 'intro';
  public introTimer: number = 2.0;
  public roundOverTimer: number = 2.5;

  public hitstopTimer: number = 0;
  public screenShake: number = 0;

  public telemetry: MatchTelemetry;
  public config: CombatEngineConfig;

  // Replay Recording
  public replayFrames: ReplayFrame[] = [];
  private replaySampleTimer: number = 0;
  public matchElapsedTime: number = 0;

  // AI Tactical state
  private aiDecisionTimer: number = 0;
  private aiPreferredAction: string = 'neutral';
  private aiAntiAirCounter: number = 0;
  private p1JumpCounter: number = 0;

  constructor(p1Def: FighterDefinition, cpuDef: FighterDefinition, config: CombatEngineConfig = {}) {
    this.config = config;
    this.p1 = this.createFighterState(p1Def, 240, 1);
    this.cpu = this.createFighterState(cpuDef, 720, -1);

    this.telemetry = {
      playerDamageDealt: 0,
      opponentDamageDealt: 0,
      playerCombosMax: 0,
      playerJumps: 0,
      playerBlocks: 0,
      playerSpecialsUsed: 0,
      opponentSpecialsUsed: 0,
      matchDurationSeconds: 0,
      currentRound: 1
    };
  }

  private createFighterState(def: FighterDefinition, x: number, facing: 1 | -1): CombatFighterState {
    return {
      definition: def,
      x,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      facing,
      isGrounded: true,
      actionState: 'idle',
      stateTimer: 0,
      stateDuration: 0,
      currentHealth: def.stats.maxHealth,
      currentEnergy: 40,
      comboCount: 0,
      comboTimer: 0,
      specialCooldown: 0,
      isBlocking: false,
      blockDuration: 0,
      blockCooldown: 0,
      isInvulnerable: false,
      invulnerableTimer: 0,
      passiveTriggered: false,
      score: 0,
      roundsWon: 0
    };
  }

  public recordReplayFrame(eventHighlight?: { type: 'hit' | 'special' | 'guard_break' | 'ko' | 'combo'; label: string }) {
    // Record snapshot of current frame for cinematic replay
    const frame: ReplayFrame = {
      timestamp: Number(this.matchElapsedTime.toFixed(3)),
      p1: {
        x: Math.round(this.p1.x),
        y: Math.round(this.p1.y),
        facing: this.p1.facing,
        actionState: this.p1.actionState,
        health: Math.round(this.p1.currentHealth),
        energy: Math.round(this.p1.currentEnergy),
        isBlocking: this.p1.isBlocking,
        blockDuration: Number(this.p1.blockDuration.toFixed(2))
      },
      cpu: {
        x: Math.round(this.cpu.x),
        y: Math.round(this.cpu.y),
        facing: this.cpu.facing,
        actionState: this.cpu.actionState,
        health: Math.round(this.cpu.currentHealth),
        energy: Math.round(this.cpu.currentEnergy),
        isBlocking: this.cpu.isBlocking,
        blockDuration: Number(this.cpu.blockDuration.toFixed(2))
      },
      projectiles: this.projectiles.map(p => ({
        x: Math.round(p.x),
        y: Math.round(p.y),
        color: p.color,
        width: p.width,
        height: p.height
      })),
      particles: this.particles.slice(0, 15).map(pt => ({
        x: Math.round(pt.x),
        y: Math.round(pt.y),
        color: pt.color,
        size: Math.round(pt.size),
        type: pt.type
      })),
      floatingTexts: this.floatingTexts.map(f => ({
        text: f.text,
        x: Math.round(f.x),
        y: Math.round(f.y),
        color: f.color
      })),
      screenShake: Math.round(this.screenShake),
      eventHighlight
    };

    this.replayFrames.push(frame);
  }

  public triggerCombatEvent(eventData: Omit<CombatEvent, 'id' | 'timestamp'>) {
    const fullEvent: CombatEvent = {
      ...eventData,
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };

    if (this.config.onCombatEvent) {
      this.config.onCombatEvent(fullEvent);
    }

    soundManager.speakCommentary(fullEvent.commentaryText, fullEvent.type === 'ko' || fullEvent.type === 'special');
  }

  public update(rawDt: number, p1Inputs: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    punch: boolean;
    kick: boolean;
    special: boolean;
    block: boolean;
  }) {
    const dt = Math.min(rawDt, 0.05);

    // Hitstop freeze
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Screenshake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Match intro / round transition updates
    if (this.roundState === 'intro') {
      this.introTimer -= dt;
      if (this.introTimer <= 0) {
        this.roundState = 'fight';
        soundManager.playRoundAnnounce();
        this.triggerCombatEvent({
          type: 'round_start',
          actorName: this.p1.definition.name,
          targetName: this.cpu.definition.name,
          commentaryText: `Round ${this.currentRound}! FIGHT!`
        });
      }
      this.updateParticles(dt);
      return;
    }

    if (this.roundState === 'round_over') {
      this.roundOverTimer -= dt;
      this.updatePhysicsAndTimers(dt);
      this.updateParticles(dt);
      if (this.roundOverTimer <= 0) {
        this.handleNextRoundOrEnd();
      }
      return;
    }

    if (this.roundState === 'match_over') {
      this.updatePhysicsAndTimers(dt);
      this.updateParticles(dt);
      return;
    }

    // Match in progress
    this.matchElapsedTime += dt;
    this.telemetry.matchDurationSeconds += dt;

    // Sample replay frame every 0.045s (~22fps recording rate)
    this.replaySampleTimer += dt;
    if (this.replaySampleTimer >= 0.045) {
      this.replaySampleTimer = 0;
      this.recordReplayFrame();
    }

    if (!this.config.trainingMode) {
      this.roundTimer = Math.max(0, this.roundTimer - dt);
      if (this.roundTimer <= 0) {
        this.handleTimeOver();
        return;
      }
    }

    // Facing direction - stabilized with deadband to prevent frame-of-reference jitter
    const dx = this.cpu.x - this.p1.x;
    if (Math.abs(dx) > 28) {
      if (['idle', 'walk_forward', 'walk_back', 'block'].includes(this.p1.actionState)) {
        this.p1.facing = dx > 0 ? 1 : -1;
      }
      if (['idle', 'walk_forward', 'walk_back', 'block'].includes(this.cpu.actionState)) {
        this.cpu.facing = dx < 0 ? 1 : -1;
      }
    }

    // Handle Player 1 Input
    this.processPlayerInput(this.p1, p1Inputs);

    // Handle CPU Adaptive AI (Medium Balanced Difficulty)
    this.processCPUAI(dt);

    // Update both fighters
    this.updateFighter(this.p1, this.cpu, dt);
    this.updateFighter(this.cpu, this.p1, dt);

    // Projectile updates
    this.updateProjectiles(dt);

    // Check attacks & collisions
    this.checkAttackHits();

    // Push apart if overlapping
    this.resolveFighterCollision();

    // Particle & Floating text updates
    this.updateParticles(dt);

    // Check KO
    if (this.p1.currentHealth <= 0 || this.cpu.currentHealth <= 0) {
      this.handleRoundFinish();
    }
  }

  private processPlayerInput(fighter: CombatFighterState, inputs: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    punch: boolean;
    kick: boolean;
    special: boolean;
    block: boolean;
  }) {
    if (fighter.actionState === 'hit' || fighter.actionState === 'ko' || fighter.actionState === 'victory') {
      return;
    }

    const canAct = fighter.actionState === 'idle' || fighter.actionState === 'walk_forward' || fighter.actionState === 'walk_back';

    // Blocking (capped at MAX_BLOCK_DURATION 5.0 seconds)
    // FIX: Allow shield to be held as long as block key is pressed and block duration hasn't expired
    const canHoldBlock = fighter.actionState === 'block' || canAct;
    const canBlock = inputs.block && fighter.isGrounded && canHoldBlock && fighter.blockCooldown <= 0 && fighter.blockDuration < MAX_BLOCK_DURATION;

    if (canBlock) {
      fighter.isBlocking = true;
      fighter.actionState = 'block';
      fighter.vx = 0;
      return;
    } else if (fighter.actionState === 'block') {
      fighter.actionState = 'idle';
      fighter.isBlocking = false;
    }

    // Special Move
    if (inputs.special && fighter.specialCooldown <= 0 && canAct) {
      if (fighter.currentEnergy >= fighter.definition.specialMove.energyCost) {
        fighter.currentEnergy -= fighter.definition.specialMove.energyCost;
        fighter.specialCooldown = fighter.definition.specialMove.cooldown;
        this.executeSpecial(fighter, this.cpu);
        this.telemetry.playerSpecialsUsed++;
        return;
      }
    }

    // Punch
    if (inputs.punch && canAct) {
      fighter.actionState = 'punch';
      fighter.stateTimer = 0;
      fighter.stateDuration = 0.32;
      fighter.vx = fighter.facing * 1.5;
      soundManager.playPunch();
      return;
    }

    // Kick
    if (inputs.kick && canAct) {
      fighter.actionState = 'kick';
      fighter.stateTimer = 0;
      fighter.stateDuration = 0.42;
      fighter.vx = fighter.facing * 2.5;
      soundManager.playKick();
      return;
    }

    // Jump
    if (inputs.up && fighter.isGrounded && canAct) {
      fighter.vy = -fighter.definition.stats.jumpForce;
      fighter.isGrounded = false;
      fighter.actionState = 'jump';
      this.p1JumpCounter++;
      this.telemetry.playerJumps++;
      soundManager.playJump();
      return;
    }

    // Movement (Walk)
    if (canAct) {
      let moveDir = 0;
      if (inputs.left) moveDir -= 1;
      if (inputs.right) moveDir += 1;

      // Speed bonus from passive
      let speedMult = 1.0;
      if (fighter.definition.passiveAbility.mechanic === 'speed_boost') speedMult = 1.2;
      if (fighter.definition.passiveAbility.mechanic === 'static_charge' && Math.abs(fighter.vx) > 0) speedMult = 1.25;

      const baseSpeed = fighter.definition.stats.speed * speedMult;
      fighter.vx = moveDir * baseSpeed;

      if (moveDir !== 0) {
        fighter.actionState = (moveDir === fighter.facing) ? 'walk_forward' : 'walk_back';
      } else {
        fighter.actionState = 'idle';
      }
    }
  }

  private processCPUAI(dt: number) {
    if (this.cpu.actionState === 'hit' || this.cpu.actionState === 'ko' || this.cpu.actionState === 'victory') {
      return;
    }

    this.aiDecisionTimer -= dt;
    const dist = Math.abs(this.cpu.x - this.p1.x);
    const p1IsAttacking = this.p1.actionState === 'punch' || this.p1.actionState === 'kick' || this.p1.actionState === 'special';
    const p1InAir = !this.p1.isGrounded;

    const canAct = this.cpu.actionState === 'idle' || this.cpu.actionState === 'walk_forward' || this.cpu.actionState === 'walk_back';

    if (this.aiDecisionTimer <= 0 && canAct) {
      // Balanced Medium Difficulty: human-like reaction window (280ms - 460ms)
      this.aiDecisionTimer = 0.28 + Math.random() * 0.18;

      // Medium reaction anti-air: moderate chance (40%) so aerial approaches are viable
      if (p1InAir && dist < 120 && Math.random() < 0.40) {
        this.cpu.actionState = 'kick';
        this.cpu.stateTimer = 0;
        this.cpu.stateDuration = 0.42;
        soundManager.playKick();
        return;
      }

      // Medium blocking: ~35% chance (45% for defensive archetype) instead of 75%
      if (p1IsAttacking && dist < 110 && this.cpu.blockCooldown <= 0 && this.cpu.blockDuration < MAX_BLOCK_DURATION) {
        const blockChance = this.cpu.definition.combatStyle === 'defensive' ? 0.45 : 0.35;
        if (Math.random() < blockChance) {
          this.cpu.isBlocking = true;
          this.cpu.actionState = 'block';
          this.cpu.vx = 0;
          return;
        }
      } else {
        this.cpu.isBlocking = false;
      }

      // Drop block after holding for 2.2 seconds to leave tactical openings
      if (this.cpu.blockDuration > 2.2) {
        this.cpu.isBlocking = false;
        if (this.cpu.actionState === 'block') this.cpu.actionState = 'idle';
      }

      // Medium special move execution: thoughtful timing when energy is sufficient
      if (this.cpu.specialCooldown <= 0 && this.cpu.currentEnergy >= this.cpu.definition.specialMove.energyCost) {
        const specialTriggerDist = this.cpu.definition.specialMove.mechanic === 'projectile_blast' ? 240 : 150;
        if (dist <= specialTriggerDist && Math.random() < 0.42) {
          this.cpu.currentEnergy -= this.cpu.definition.specialMove.energyCost;
          this.cpu.specialCooldown = this.cpu.definition.specialMove.cooldown;
          this.executeSpecial(this.cpu, this.p1);
          this.telemetry.opponentSpecialsUsed++;
          return;
        }
      }

      // Close combat strikes: balanced distribution (34% punch, 24% kick, 42% reposition)
      if (dist < 90) {
        const attackRoll = Math.random();
        if (attackRoll < 0.34) {
          this.cpu.actionState = 'punch';
          this.cpu.stateTimer = 0;
          this.cpu.stateDuration = 0.32;
          this.cpu.vx = this.cpu.facing * 1.5;
          soundManager.playPunch();
          return;
        } else if (attackRoll < 0.58) {
          this.cpu.actionState = 'kick';
          this.cpu.stateTimer = 0;
          this.cpu.stateDuration = 0.42;
          this.cpu.vx = this.cpu.facing * 2.2;
          soundManager.playKick();
          return;
        }
      }

      // Medium distance spacing: reposition without overly aggressive rush
      if (dist > 130) {
        // Step toward player at standard walk speed
        const dir = this.p1.x > this.cpu.x ? 1 : -1;
        this.cpu.vx = dir * this.cpu.definition.stats.speed * 0.95;
        this.cpu.actionState = 'walk_forward';
      } else if (dist < 65 && Math.random() < 0.35) {
        // Tactical backstep
        const dir = this.p1.x > this.cpu.x ? -1 : 1;
        this.cpu.vx = dir * this.cpu.definition.stats.speed * 0.7;
        this.cpu.actionState = 'walk_back';
      } else {
        this.cpu.vx = 0;
        this.cpu.actionState = 'idle';
      }
    }
  }

  private executeSpecial(user: CombatFighterState, target: CombatFighterState) {
    user.actionState = 'special';
    user.stateTimer = 0;
    user.stateDuration = 0.6;
    user.vx = 0;

    const mechanic = user.definition.specialMove.mechanic;
    soundManager.playSpecial(mechanic);

    // Replay highlight & Live commentary
    this.recordReplayFrame({
      type: 'special',
      label: `${user.definition.name} EXECUTED ${user.definition.specialMove.name}!`
    });
    this.triggerCombatEvent({
      type: 'special',
      actorName: user.definition.name,
      moveName: user.definition.specialMove.name,
      commentaryText: `UNBELIEVABLE! ${user.definition.name} unleashes ${user.definition.specialMove.name}!`
    });

    // Teleport behind opponent
    if (mechanic === 'teleport_strike') {
      const behindX = target.x - target.facing * 75;
      user.x = Math.max(ARENA_WIDTH * 0.08, Math.min(ARENA_WIDTH * 0.92, behindX));
      user.facing = target.x > user.x ? 1 : -1;
      this.spawnRingParticles(user.x, user.y - 50, user.definition.appearance.primaryColor);
      this.spawnSlashParticles(target.x, target.y - 50, user.definition.appearance.primaryColor);
    }
    // Fire projectile
    else if (mechanic === 'projectile_blast') {
      const projVx = user.facing * 11;
      this.projectiles.push({
        id: 'proj_' + Date.now() + Math.random(),
        ownerId: user.definition.id,
        x: user.x + user.facing * 40,
        y: user.y - 65,
        vx: projVx,
        vy: 0,
        width: 38,
        height: 28,
        damage: user.definition.specialMove.damage,
        color: user.definition.appearance.primaryColor,
        effect: user.definition.appearance.visualEffects[0] || 'plasma_glow',
        duration: 2.2
      });
      this.spawnSparkBurst(user.x + user.facing * 35, user.y - 65, user.definition.appearance.primaryColor, 12);
    }
    // Frenzy roll / Ground slam
    else if (mechanic === 'frenzy_roll') {
      user.vx = user.facing * 12;
      this.spawnSparkBurst(user.x, user.y - 20, user.definition.appearance.accentColor, 16);
    }
    else if (mechanic === 'ground_slam' || mechanic === 'counter_stance') {
      this.screenShake = 12;
      this.spawnRingParticles(user.x, user.y - 10, user.definition.appearance.primaryColor);
    }

    // Weakness check: slow recovery penalty
    if (user.definition.weakness.mechanic === 'slow_recovery') {
      user.stateDuration += 0.35;
    }
  }

  private updateFighter(fighter: CombatFighterState, opponent: CombatFighterState, dt: number) {
    // Energy regeneration
    fighter.currentEnergy = Math.min(
      100,
      fighter.currentEnergy + fighter.definition.stats.energyRegen * 5 * dt
    );

    // Block Duration and Guard Break management (Max 5.0 seconds)
    if (fighter.isBlocking && fighter.actionState === 'block') {
      fighter.blockDuration += dt;

      // Warning sparks when shield reaches critical status (> 3.8s)
      if (fighter.blockDuration >= 3.8 && Math.random() < 0.35) {
        this.spawnBlockSparks(fighter.x + fighter.facing * 20, fighter.y - 60);
      }

      if (fighter.blockDuration >= MAX_BLOCK_DURATION) {
        // Guard Break triggered! Cannot hold shield for more than 5 seconds
        fighter.isBlocking = false;
        fighter.actionState = 'hit';
        fighter.stateTimer = 0;
        fighter.stateDuration = 0.65; // Stagger penalty
        fighter.blockCooldown = 2.5; // 2.5s cooldown before shield can be re-engaged
        fighter.blockDuration = 0;

        this.hitstopTimer = 0.08;
        this.screenShake = 12;
        soundManager.playHeavyImpact();
        this.spawnBlockSparks(fighter.x + fighter.facing * 20, fighter.y - 60);
        this.spawnFloatingText('GUARD BREAK!', fighter.x, fighter.y - 85, '#ef4444', 1.4);

        this.triggerCombatEvent({
          type: 'guard_break',
          actorName: opponent.definition.name,
          targetName: fighter.definition.name,
          commentaryText: `GUARD BREAK! ${fighter.definition.name}'s shield shattered!`
        });
      }
    } else {
      // Cooldown timer decay
      if (fighter.blockCooldown > 0) {
        fighter.blockCooldown = Math.max(0, fighter.blockCooldown - dt);
      }
      // Shield recovery when not blocking (recovers back to full 5 seconds)
      if (fighter.blockDuration > 0) {
        fighter.blockDuration = Math.max(0, fighter.blockDuration - dt * 2.0);
      }
    }

    // Special Cooldown
    if (fighter.specialCooldown > 0) {
      fighter.specialCooldown = Math.max(0, fighter.specialCooldown - dt);
    }

    // Invulnerability timer
    if (fighter.invulnerableTimer > 0) {
      fighter.invulnerableTimer -= dt;
      if (fighter.invulnerableTimer <= 0) fighter.isInvulnerable = false;
    }

    // State Timer
    if (fighter.stateDuration > 0) {
      fighter.stateTimer += dt;
      if (fighter.stateTimer >= fighter.stateDuration) {
        if (fighter.actionState !== 'ko' && fighter.actionState !== 'victory') {
          fighter.actionState = 'idle';
          fighter.stateDuration = 0;
          fighter.stateTimer = 0;
        }
      }
    }

    // Combo Timer
    if (fighter.comboCount > 0) {
      fighter.comboTimer -= dt;
      if (fighter.comboTimer <= 0) {
        fighter.comboCount = 0;
      }
    }

    // Passive ability checks
    if (fighter.definition.passiveAbility.mechanic === 'low_hp_rage') {
      fighter.passiveTriggered = fighter.currentHealth <= fighter.definition.stats.maxHealth * 0.35;
    }

    // Physics
    fighter.x += fighter.vx;
    fighter.y += fighter.vy;

    // Apply gravity if not grounded
    if (!fighter.isGrounded) {
      fighter.vy += GRAVITY * dt * 2.2;
    }

    // Ground collision
    if (fighter.y >= GROUND_Y) {
      fighter.y = GROUND_Y;
      fighter.vy = 0;
      fighter.isGrounded = true;
      if (fighter.actionState === 'jump') {
        fighter.actionState = 'idle';
      }
    }

    // Arena boundary clamp
    const minX = 60;
    const maxX = ARENA_WIDTH - 60;
    if (fighter.x < minX) fighter.x = minX;
    if (fighter.x > maxX) fighter.x = maxX;

    // Air friction & ground friction
    if (fighter.isGrounded && fighter.actionState !== 'walk_forward' && fighter.actionState !== 'walk_back' && fighter.actionState !== 'special') {
      fighter.vx *= 0.75;
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.duration -= dt;

      // Trail particles
      if (Math.random() < 0.6) {
        this.particles.push({
          id: 'trail_' + Math.random(),
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: p.color,
          size: 4 + Math.random() * 3,
          life: 0.25,
          maxLife: 0.25,
          type: 'spark'
        });
      }

      // Check collision with fighters
      const target = p.ownerId === this.p1.definition.id ? this.cpu : this.p1;
      const targetHurtbox = this.getHurtbox(target);

      if (this.isIntersecting({ x: p.x - p.width / 2, y: p.y - p.height / 2, width: p.width, height: p.height }, targetHurtbox)) {
        this.applyHit(
          p.ownerId === this.p1.definition.id ? this.p1 : this.cpu,
          target,
          p.damage,
          Math.sign(p.vx) * 6,
          -4,
          'special'
        );
        this.spawnSparkBurst(p.x, p.y, p.color, 18);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Out of bounds or expired
      if (p.x < 30 || p.x > ARENA_WIDTH - 30 || p.duration <= 0) {
        this.spawnSparkBurst(p.x, p.y, p.color, 8);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private checkAttackHits() {
    this.checkFighterAttack(this.p1, this.cpu);
    this.checkFighterAttack(this.cpu, this.p1);
  }

  private checkFighterAttack(attacker: CombatFighterState, defender: CombatFighterState) {
    if (defender.isInvulnerable || defender.actionState === 'ko') return;

    let attackBox: AttackBox | null = null;
    const progress = attacker.stateTimer / (attacker.stateDuration || 1);

    // Punch active window: 30% - 60%
    if (attacker.actionState === 'punch' && progress >= 0.25 && progress <= 0.65) {
      attackBox = {
        x: attacker.facing > 0 ? attacker.x + 10 : attacker.x - 70,
        y: attacker.y - 75,
        width: attacker.definition.primaryAttack.range || 65,
        height: 35,
        damage: attacker.definition.primaryAttack.damage,
        knockbackX: attacker.facing * 4,
        knockbackY: -2,
        hitType: 'light'
      };
    }
    // Kick active window: 35% - 70%
    else if (attacker.actionState === 'kick' && progress >= 0.3 && progress <= 0.7) {
      attackBox = {
        x: attacker.facing > 0 ? attacker.x + 15 : attacker.x - 85,
        y: attacker.y - 55,
        width: 80,
        height: 40,
        damage: 16,
        knockbackX: attacker.facing * 7,
        knockbackY: -5,
        hitType: 'heavy'
      };
    }
    // Special move contact (e.g. Frenzy roll or teleport strike)
    else if (attacker.actionState === 'special' && progress >= 0.4 && progress <= 0.8) {
      if (attacker.definition.specialMove.mechanic === 'frenzy_roll' || attacker.definition.specialMove.mechanic === 'teleport_strike') {
        attackBox = {
          x: attacker.facing > 0 ? attacker.x : attacker.x - 80,
          y: attacker.y - 70,
          width: 80,
          height: 60,
          damage: attacker.definition.specialMove.damage,
          knockbackX: attacker.facing * 9,
          knockbackY: -6,
          hitType: 'special'
        };
      }
    }

    if (attackBox) {
      const defenderHurtbox = this.getHurtbox(defender);
      if (this.isIntersecting(attackBox, defenderHurtbox)) {
        this.applyHit(
          attacker,
          defender,
          attackBox.damage,
          attackBox.knockbackX,
          attackBox.knockbackY,
          attackBox.hitType
        );
        // Only hit once per attack swing
        attacker.stateTimer = attacker.stateDuration * 0.72;
      }
    }
  }

  private applyHit(
    attacker: CombatFighterState,
    defender: CombatFighterState,
    baseDamage: number,
    knockbackX: number,
    knockbackY: number,
    hitType: 'light' | 'heavy' | 'special'
  ) {
    let finalDamage = baseDamage * attacker.definition.stats.power;

    // Rage passive damage boost
    if (attacker.passiveTriggered) {
      finalDamage *= 1.35;
    }

    // Defense reduction
    finalDamage /= (defender.definition.stats.defense || 1.0);

    // Heavy damage weakness check
    if (hitType === 'heavy' && defender.definition.weakness.mechanic === 'heavy_damage_vulnerable') {
      finalDamage *= 1.25;
    }

    // Blocking mechanic - guarantee 100% reliable shield protection
    const isActivelyShielding = (defender.isBlocking || defender.actionState === 'block') && defender.blockCooldown <= 0;
    if (isActivelyShielding) {
      finalDamage *= 0.15; // 85% damage mitigation
      knockbackX *= 0.2;
      knockbackY = 0;

      // Turn defender to face the incoming impact so shield directly blocks the attack
      defender.facing = attacker.x > defender.x ? 1 : -1;

      // Monk energy on block
      if (defender.definition.passiveAbility.mechanic === 'energy_on_block') {
        defender.currentEnergy = Math.min(100, defender.currentEnergy + 15);
      }

      // Counter damage passive
      if (defender.definition.passiveAbility.mechanic === 'counter_damage') {
        attacker.currentHealth = Math.max(0, attacker.currentHealth - 6);
        this.spawnFloatingText('COUNTER!', attacker.x, attacker.y - 70, '#f43f5e');
      }

      soundManager.playBlock();
      this.spawnBlockSparks(defender.x + defender.facing * 25, defender.y - 60);
      this.spawnRingParticles(defender.x + defender.facing * 25, defender.y - 60, '#38bdf8');
      this.spawnFloatingText('BLOCKED!', defender.x, defender.y - 85, '#38bdf8', 1.1);

      if (defender === this.p1) this.telemetry.playerBlocks++;

      if (Math.random() < 0.28) {
        this.triggerCombatEvent({
          type: 'block',
          actorName: defender.definition.name,
          targetName: attacker.definition.name,
          commentaryText: `Rock-solid defense! ${defender.definition.name} blocks the strike!`
        });
      }
    } else {
      // Direct hit
      defender.actionState = 'hit';
      defender.stateTimer = 0;
      defender.stateDuration = hitType === 'heavy' ? 0.38 : 0.22;
      defender.vx = knockbackX;
      defender.vy = knockbackY;
      defender.isGrounded = false;

      // Hitstop and Screen shake for juicy game feel
      this.hitstopTimer = hitType === 'special' ? 0.08 : (hitType === 'heavy' ? 0.06 : 0.035);
      this.screenShake = hitType === 'special' ? 14 : (hitType === 'heavy' ? 9 : 4);

      if (hitType === 'special' || hitType === 'heavy') {
        soundManager.playHeavyImpact();
      }

      // Combo Tracking
      attacker.comboCount++;
      attacker.comboTimer = 1.2;
      if (attacker === this.p1) {
        this.telemetry.playerCombosMax = Math.max(this.telemetry.playerCombosMax, attacker.comboCount);
      }

      this.spawnHitSparks(defender.x, defender.y - 60, attacker.definition.appearance.primaryColor);

      // Trigger commentary events
      if (hitType === 'special') {
        this.triggerCombatEvent({
          type: 'special',
          actorName: attacker.definition.name,
          targetName: defender.definition.name,
          details: `${attacker.definition.specialMove.name} lands!`,
          commentaryText: `DIRECT HIT! ${attacker.definition.name}'s ${attacker.definition.specialMove.name} connects squarely!`
        });
      } else if (attacker.comboCount >= 3) {
        this.triggerCombatEvent({
          type: 'combo',
          actorName: attacker.definition.name,
          targetName: defender.definition.name,
          details: `${attacker.comboCount}-Hit Combo!`,
          commentaryText: `${attacker.comboCount}-HIT COMBO! ${attacker.definition.name} is on fire!`
        });
      } else if (hitType === 'heavy' && Math.random() < 0.35) {
        this.triggerCombatEvent({
          type: 'kick',
          actorName: attacker.definition.name,
          targetName: defender.definition.name,
          commentaryText: `A heavy kick crushes through from ${attacker.definition.name}!`
        });
      } else if (Math.random() < 0.18) {
        this.triggerCombatEvent({
          type: 'punch',
          actorName: attacker.definition.name,
          targetName: defender.definition.name,
          commentaryText: `Snappy strike from ${attacker.definition.name}!`
        });
      }
    }

    finalDamage = Math.round(finalDamage);
    defender.currentHealth = Math.max(0, defender.currentHealth - finalDamage);

    // Telemetry
    if (attacker === this.p1) {
      this.telemetry.playerDamageDealt += finalDamage;
    } else {
      this.telemetry.opponentDamageDealt += finalDamage;
    }

    // Floating damage numbers
    const textColor = defender.isBlocking ? '#94a3b8' : (hitType === 'special' ? '#f59e0b' : '#ffffff');
    this.spawnFloatingText(`-${finalDamage}`, defender.x, defender.y - 85, textColor);

    if (attacker.comboCount > 1 && !defender.isBlocking) {
      this.spawnFloatingText(`${attacker.comboCount} HITS!`, attacker.x, attacker.y - 115, '#38bdf8');
    }
  }

  private resolveFighterCollision() {
    const minDistance = 50;
    const dx = this.cpu.x - this.p1.x;
    const absDist = Math.abs(dx);

    if (absDist < minDistance && this.p1.y === GROUND_Y && this.cpu.y === GROUND_Y) {
      const overlap = (minDistance - absDist) / 2;
      const dir = dx > 0 ? 1 : -1;
      this.p1.x = Math.max(60, this.p1.x - dir * overlap);
      this.cpu.x = Math.min(ARENA_WIDTH - 60, this.cpu.x + dir * overlap);
    }
  }

  private getHurtbox(fighter: CombatFighterState): HitBox {
    return {
      x: fighter.x - 30,
      y: fighter.y - 105,
      width: 60,
      height: 105
    };
  }

  private isIntersecting(a: HitBox, b: HitBox): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  private handleTimeOver() {
    this.roundState = 'round_over';
    this.roundOverTimer = 2.5;

    let winner: 'p1' | 'cpu' | 'draw' = 'draw';
    if (this.p1.currentHealth > this.cpu.currentHealth) {
      winner = 'p1';
      this.p1.roundsWon++;
      this.p1.actionState = 'victory';
      soundManager.playVictory();
    } else if (this.cpu.currentHealth > this.p1.currentHealth) {
      winner = 'cpu';
      this.cpu.roundsWon++;
      this.cpu.actionState = 'victory';
    }

    this.spawnFloatingText('TIME OVER!', ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 30, '#f59e0b', 2.0);
    if (this.config.onRoundEnd) this.config.onRoundEnd(winner);
  }

  private handleRoundFinish() {
    this.roundState = 'round_over';
    this.roundOverTimer = 2.5;

    let winner: 'p1' | 'cpu' = 'p1';
    if (this.p1.currentHealth <= 0) {
      winner = 'cpu';
      this.p1.actionState = 'ko';
      this.cpu.actionState = 'victory';
      this.cpu.roundsWon++;
    } else {
      winner = 'p1';
      this.cpu.actionState = 'ko';
      this.p1.actionState = 'victory';
      this.p1.roundsWon++;
      soundManager.playVictory();
    }

    this.screenShake = 16;
    this.spawnFloatingText('K.O.!', ARENA_WIDTH / 2, ARENA_HEIGHT / 2 - 30, '#ef4444', 2.5);

    const victor = winner === 'p1' ? this.p1 : this.cpu;
    const loser = winner === 'p1' ? this.cpu : this.p1;
    this.triggerCombatEvent({
      type: 'ko',
      actorName: victor.definition.name,
      targetName: loser.definition.name,
      commentaryText: `IT IS OVER! KNOCKOUT! ${victor.definition.name} claims the victory!`
    });

    if (this.config.onRoundEnd) this.config.onRoundEnd(winner);
  }

  private handleNextRoundOrEnd() {
    const roundsToWin = 2; // Best of 3
    if (this.p1.roundsWon >= roundsToWin || this.cpu.roundsWon >= roundsToWin) {
      this.roundState = 'match_over';
      const matchWinner = this.p1.roundsWon >= roundsToWin ? 'p1' : 'cpu';
      this.telemetry.winner = matchWinner;
      if (this.config.onMatchEnd) {
        this.config.onMatchEnd(matchWinner, this.telemetry, this.replayFrames);
      }
    } else {
      // Start next round
      this.currentRound++;
      this.telemetry.currentRound = this.currentRound;
      this.roundTimer = 99;
      this.introTimer = 1.8;
      this.roundState = 'intro';

      // Reset fighter positions & health
      this.p1.x = 240;
      this.p1.y = GROUND_Y;
      this.p1.vx = 0;
      this.p1.vy = 0;
      this.p1.actionState = 'idle';
      this.p1.currentHealth = this.p1.definition.stats.maxHealth;
      this.p1.currentEnergy = 40;
      this.p1.comboCount = 0;
      this.p1.blockDuration = 0;
      this.p1.blockCooldown = 0;

      this.cpu.x = 720;
      this.cpu.y = GROUND_Y;
      this.cpu.vx = 0;
      this.cpu.vy = 0;
      this.cpu.actionState = 'idle';
      this.cpu.currentHealth = this.cpu.definition.stats.maxHealth;
      this.cpu.currentEnergy = 40;
      this.cpu.comboCount = 0;
      this.cpu.blockDuration = 0;
      this.cpu.blockCooldown = 0;
    }
  }

  private updatePhysicsAndTimers(dt: number) {
    this.updateFighter(this.p1, this.cpu, dt);
    this.updateFighter(this.cpu, this.p1, dt);
  }

  // Visual FX spawners
  public spawnHitSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        id: 'spark_' + Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        life: 0.3,
        maxLife: 0.3,
        type: 'spark'
      });
    }
  }

  public spawnBlockSparks(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        id: 'block_' + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: '#67e8f9',
        size: 5,
        life: 0.2,
        maxLife: 0.2,
        type: 'block'
      });
    }
  }

  public spawnRingParticles(x: number, y: number, color: string) {
    this.particles.push({
      id: 'ring_' + Math.random(),
      x,
      y,
      vx: 0,
      vy: 0,
      color,
      size: 20,
      life: 0.45,
      maxLife: 0.45,
      type: 'ring'
    });
  }

  public spawnSlashParticles(x: number, y: number, color: string) {
    this.particles.push({
      id: 'slash_' + Math.random(),
      x,
      y,
      vx: 0,
      vy: 0,
      color,
      size: 60,
      life: 0.35,
      maxLife: 0.35,
      type: 'slash'
    });
  }

  public spawnSparkBurst(x: number, y: number, color: string, count: number = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: 'burst_' + Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        color,
        size: 3 + Math.random() * 4,
        life: 0.35,
        maxLife: 0.35,
        type: 'spark'
      });
    }
  }

  public spawnFloatingText(text: string, x: number, y: number, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: 'txt_' + Math.random(),
      text,
      x,
      y,
      color,
      life: 0.85,
      scale
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.type === 'ring') p.size += 180 * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= 35 * dt;
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}
