import React from 'react';
import { CombatFighterState, FighterDefinition, VisualArchetype } from '../types/fighter';

interface FighterRendererProps {
  fighter: FighterDefinition;
  combatState?: CombatFighterState;
  facing?: 1 | -1;
  scale?: number;
  isAnimated?: boolean;
}

export const FighterRenderer: React.FC<FighterRendererProps> = ({
  fighter,
  combatState,
  facing = 1,
  scale = 1.0,
  isAnimated = true
}) => {
  const currentAction = combatState ? combatState.actionState : 'idle';
  const currentFacing = combatState ? combatState.facing : facing;
  const isP1 = combatState?.facing === 1;

  const {
    archetype,
    primaryColor,
    secondaryColor,
    accentColor,
    glowColor,
    weaponType,
    visualEffects,
    silhouetteSize,
    capeOrWings
  } = fighter.appearance;

  // Animation offsets based on action state
  let torsoOffset = 0;
  let rightArmRotation = 0;
  let leftArmRotation = 0;
  let rightLegRotation = 0;
  let leftLegRotation = 0;
  let auraOpacity = 0.35;
  let weaponOffsetX = 0;
  let weaponOffsetY = 0;
  let weaponRotation = 0;

  if (currentAction === 'idle') {
    torsoOffset = isAnimated ? Math.sin(Date.now() / 250) * 2 : 0;
    rightArmRotation = 8;
    leftArmRotation = -12;
  } else if (currentAction === 'walk_forward' || currentAction === 'walk_back') {
    torsoOffset = Math.sin(Date.now() / 120) * 3;
    leftLegRotation = Math.sin(Date.now() / 120) * 25;
    rightLegRotation = -Math.sin(Date.now() / 120) * 25;
    rightArmRotation = -Math.sin(Date.now() / 120) * 20;
    leftArmRotation = Math.sin(Date.now() / 120) * 20;
  } else if (currentAction === 'jump') {
    torsoOffset = -10;
    leftLegRotation = -20;
    rightLegRotation = 15;
    rightArmRotation = -35;
    leftArmRotation = -35;
  } else if (currentAction === 'punch') {
    rightArmRotation = -85;
    weaponOffsetX = 35;
    weaponOffsetY = -15;
    weaponRotation = 45;
  } else if (currentAction === 'kick') {
    rightLegRotation = -75;
    torsoOffset = -5;
    leftArmRotation = -30;
    rightArmRotation = 20;
  } else if (currentAction === 'special') {
    auraOpacity = 0.85;
    torsoOffset = -8;
    rightArmRotation = -60;
    leftArmRotation = -60;
    weaponOffsetX = 20;
    weaponOffsetY = -30;
    weaponRotation = 90;
  } else if (currentAction === 'block') {
    rightArmRotation = -65;
    leftArmRotation = -70;
    torsoOffset = 4;
  } else if (currentAction === 'hit') {
    torsoOffset = 8;
    rightArmRotation = 35;
    leftArmRotation = 45;
    leftLegRotation = 20;
    rightLegRotation = 30;
  } else if (currentAction === 'ko') {
    torsoOffset = 40;
    rightArmRotation = 60;
    leftArmRotation = 70;
    rightLegRotation = 80;
    leftLegRotation = 85;
  } else if (currentAction === 'victory') {
    rightArmRotation = -140;
    leftArmRotation = -40;
    torsoOffset = -6;
    auraOpacity = 0.7;
  }

  // Aura effect selection
  const hasElectric = visualEffects.includes('electric_arcs');
  const hasFire = visualEffects.includes('fire_trails');
  const hasFrost = visualEffects.includes('frost_shards');
  const hasDarkVoid = visualEffects.includes('dark_void');
  const hasRings = visualEffects.includes('gravity_rings');
  const hasSacred = visualEffects.includes('sacred_light');

  // Heavy silhouette width multiplier
  const widthMult = silhouetteSize === 'heavy' ? 1.35 : (silhouetteSize === 'compact' ? 0.88 : 1.0);
  const heightMult = silhouetteSize === 'heavy' ? 1.15 : (silhouetteSize === 'compact' ? 0.92 : 1.0);

  return (
    <div
      className="relative flex items-center justify-center select-none pointer-events-none transition-transform duration-75"
      style={{
        transform: `scaleX(${currentFacing}) scale(${scale})`,
        transformOrigin: 'bottom center',
        filter: combatState?.actionState === 'hit' ? 'brightness(1.8) contrast(1.2)' : 'none'
      }}
    >
      <svg
        width={140 * widthMult}
        height={170 * heightMult}
        viewBox="-70 -140 140 170"
        className="overflow-visible"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id={`glow_${fighter.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} stopOpacity={auraOpacity} />
            <stop offset="70%" stopColor={primaryColor} stopOpacity={auraOpacity * 0.4} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`grad_armor_${fighter.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id={`filter_glow_${fighter.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="0" cy="18" rx={32 * widthMult} ry="7" fill="rgba(0,0,0,0.45)" />

        {/* Background Energy Aura */}
        <circle
          cx="0"
          cy={-55 + torsoOffset}
          r={55 * widthMult}
          fill={`url(#glow_${fighter.id})`}
          className={isAnimated ? 'animate-pulse' : ''}
        />

        {/* Cape or Astral Wings */}
        {capeOrWings && (
          <path
            d={`M -8 -85 Q -38 -55, -28 10 Q -10 -30, 4 -85 Z`}
            fill={secondaryColor}
            opacity="0.85"
            transform={`translate(0, ${torsoOffset})`}
          />
        )}

        {/* Gravity Rings / Orbitals */}
        {hasRings && (
          <ellipse
            cx="0"
            cy={-60 + torsoOffset}
            rx="52"
            ry="18"
            fill="none"
            stroke={accentColor}
            strokeWidth="2.5"
            strokeDasharray="8 4"
            opacity="0.8"
            transform="rotate(-20)"
          />
        )}

        {/* Back Leg */}
        <g transform={`translate(-10, 0) rotate(${leftLegRotation}, -10, -30)`}>
          <rect
            x="-6"
            y="-30"
            width={12 * widthMult}
            height="32"
            rx="5"
            fill={secondaryColor}
          />
          <rect
            x="-7"
            y="-2"
            width={16 * widthMult}
            height="18"
            rx="4"
            fill="#0f172a"
          />
        </g>

        {/* Front Leg */}
        <g transform={`translate(10, 0) rotate(${rightLegRotation}, 10, -30)`}>
          <rect
            x="-6"
            y="-30"
            width={12 * widthMult}
            height="32"
            rx="5"
            fill={primaryColor}
          />
          <rect
            x="-7"
            y="-2"
            width={16 * widthMult}
            height="18"
            rx="4"
            fill="#1e293b"
          />
        </g>

        {/* TORSO & ARCHETYPE CHASSIS */}
        <g transform={`translate(0, ${torsoOffset})`}>
          {/* FOOD BRAWLER (Samosa / Dumpling Titan) */}
          {archetype === 'food_brawler' ? (
            <g>
              <polygon
                points="-38,0 0,-92 38,0"
                fill={`url(#grad_armor_${fighter.id})`}
                stroke={accentColor}
                strokeWidth="3.5"
              />
              {/* Crispy golden blisters and chutney core */}
              <circle cx="0" cy="-42" r="14" fill="#b45309" />
              <circle cx="0" cy="-42" r="8" fill="#ef4444" className="animate-pulse" />
              <path d="M -18 -20 Q 0 -5 18 -20" stroke="#f59e0b" strokeWidth="3" fill="none" />
              {/* Eyes */}
              <circle cx="-10" cy="-62" r="4" fill="#ffffff" />
              <circle cx="-10" cy="-62" r="2" fill="#000000" />
              <circle cx="10" cy="-62" r="4" fill="#ffffff" />
              <circle cx="10" cy="-62" r="2" fill="#000000" />
            </g>
          ) : archetype === 'robot_monk' ? (
            /* ROBOT MONK */
            <g>
              {/* Monk Halo */}
              <circle
                cx="0"
                cy="-95"
                r="22"
                fill="none"
                stroke={glowColor}
                strokeWidth="2.5"
                strokeDasharray="6 3"
                className="animate-spin"
                style={{ animationDuration: '6s' }}
              />
              {/* Robe and armor */}
              <path
                d="M -18 -80 L 18 -80 L 26 -25 L -26 -25 Z"
                fill={`url(#grad_armor_${fighter.id})`}
              />
              {/* Kinetic Core Matrix */}
              <polygon points="0,-65 -8,-52 0,-38 8,-52" fill={accentColor} />
              {/* Head */}
              <rect x="-11" y="-102" width="22" height="20" rx="6" fill="#e2e8f0" />
              {/* Sensor Visor */}
              <rect x="-9" y="-96" width="18" height="6" rx="3" fill={glowColor} />
            </g>
          ) : archetype === 'shadow_assassin' ? (
            /* SHADOW ASSASSIN */
            <g>
              {/* Flowing shroud */}
              <path
                d="M -22 -80 Q -32 -40 -20 -20 L 20 -20 Q 32 -40 22 -80 Z"
                fill="#090d16"
                stroke={primaryColor}
                strokeWidth="2"
              />
              {/* Void chest glyph */}
              <polygon points="0,-72 -10,-55 0,-40 10,-55" fill={primaryColor} opacity="0.9" />
              {/* Hooded Head */}
              <path d="M -16 -80 Q 0 -115 16 -80 Z" fill="#090d16" stroke={secondaryColor} strokeWidth="2" />
              {/* Glowing Assassin Eyes */}
              <ellipse cx="-5" cy="-90" rx="3" ry="1.5" fill={glowColor} />
              <ellipse cx="6" cy="-90" rx="3" ry="1.5" fill={glowColor} />
            </g>
          ) : archetype === 'cosmic_entity' ? (
            /* COSMIC ENTITY */
            <g>
              {/* Nebula silhouette */}
              <ellipse cx="0" cy="-52" rx={24 * widthMult} ry="32" fill={`url(#grad_armor_${fighter.id})`} />
              <circle cx="0" cy="-52" r="14" fill="#ffffff" opacity="0.9" />
              <circle cx="0" cy="-52" r="8" fill={glowColor} className="animate-pulse" />
              {/* Celestial Horns / Crown */}
              <path d="M -14 -90 Q -24 -115 -18 -120 Q -8 -105 -6 -88 Z" fill={secondaryColor} />
              <path d="M 14 -90 Q 24 -115 18 -120 Q 8 -105 6 -88 Z" fill={secondaryColor} />
              {/* Head */}
              <circle cx="0" cy="-92" r="13" fill={primaryColor} />
              <circle cx="-4" cy="-94" r="2.5" fill="#ffffff" />
              <circle cx="4" cy="-94" r="2.5" fill="#ffffff" />
            </g>
          ) : (
            /* CYBER SAMURAI & GENERAL WARRIORS */
            <g>
              {/* Breastplate */}
              <path
                d="M -18 -82 L 18 -82 L 24 -30 L -24 -30 Z"
                fill={`url(#grad_armor_${fighter.id})`}
                stroke={accentColor}
                strokeWidth="2"
              />
              {/* Armor Core / Crest */}
              <circle cx="0" cy="-58" r="9" fill={glowColor} filter={`url(#filter_glow_${fighter.id})`} />
              {/* Belt & Sash */}
              <rect x="-20" y="-30" width="40" height="7" fill={secondaryColor} rx="2" />
              {/* Helmet / Kabuto */}
              <path
                d="M -15 -82 L 15 -82 L 12 -105 L -12 -105 Z"
                fill="#1e293b"
                stroke={primaryColor}
                strokeWidth="2"
              />
              {/* Kabuto Horns/Crest */}
              <path d="M -12 -105 Q -22 -125 0 -118 Q 22 -125 12 -105 Z" fill={accentColor} />
              {/* Glowing Visor */}
              <rect x="-9" y="-95" width="18" height="5" rx="2.5" fill={glowColor} />
            </g>
          )}

          {/* Left Arm (Behind) */}
          <g transform={`translate(-18, -75) rotate(${leftArmRotation}, -18, -75)`}>
            <rect x="-6" y="0" width={11 * widthMult} height="28" rx="5" fill={secondaryColor} />
            <circle cx="0" cy="30" r="6" fill="#334155" />
          </g>

          {/* Right Arm (Forward) + Weapon */}
          <g transform={`translate(18, -75) rotate(${rightArmRotation}, 18, -75)`}>
            <rect x="-5" y="0" width={12 * widthMult} height="28" rx="5" fill={primaryColor} />
            <circle cx="0" cy="30" r="7" fill={accentColor} />

            {/* WEAPONS */}
            <g transform={`translate(${weaponOffsetX}, ${30 + weaponOffsetY}) rotate(${weaponRotation})`}>
              {weaponType === 'katana' && (
                <g>
                  {/* Katana hilt */}
                  <rect x="-2" y="-12" width="4" height="24" fill="#0f172a" />
                  <rect x="-6" y="-14" width="12" height="4" fill="#e2e8f0" rx="1" />
                  {/* Blade */}
                  <path
                    d="M -2 -14 L 0 -85 Q 2 -88 4 -85 L 2 -14 Z"
                    fill="#f8fafc"
                    stroke={glowColor}
                    strokeWidth="2"
                    filter={`url(#filter_glow_${fighter.id})`}
                  />
                </g>
              )}

              {weaponType === 'energy_blades' && (
                <g>
                  <path
                    d="M -4 0 L 0 -55 L 4 0 Z"
                    fill={glowColor}
                    filter={`url(#filter_glow_${fighter.id})`}
                  />
                  <circle cx="0" cy="0" r="6" fill={primaryColor} />
                </g>
              )}

              {weaponType === 'mystic_staff' && (
                <g>
                  <rect x="-3" y="-60" width="6" height="90" fill="#d97706" rx="2" />
                  <circle cx="0" cy="-60" r="10" fill="none" stroke={glowColor} strokeWidth="3" />
                  <circle cx="0" cy="-60" r="4" fill={accentColor} />
                </g>
              )}

              {weaponType === 'shadow_daggers' && (
                <g>
                  <polygon points="0,-42 -6,-10 6,-10" fill={primaryColor} stroke="#ffffff" strokeWidth="1" />
                </g>
              )}

              {weaponType === 'cosmic_orb' && (
                <g>
                  <circle cx="0" cy="-20" r="14" fill={glowColor} filter={`url(#filter_glow_${fighter.id})`} />
                  <circle cx="0" cy="-20" r="8" fill="#ffffff" />
                </g>
              )}

              {weaponType === 'power_fists' && (
                <g>
                  <rect x="-8" y="-8" width="16" height="16" rx="4" fill={accentColor} stroke="#ffffff" strokeWidth="1.5" />
                </g>
              )}
            </g>
          </g>

          {/* Elemental FX overlay: Sparks or Flame bursts */}
          {hasElectric && (
            <path
              d="M -30 -60 L -18 -45 L -26 -35 L -10 -20"
              stroke="#67e8f9"
              strokeWidth="2"
              fill="none"
              className={isAnimated ? 'animate-pulse' : ''}
            />
          )}

          {hasFire && (
            <path
              d="M 20 -40 Q 30 -65 24 -80 Q 15 -60 20 -40"
              fill="#ef4444"
              opacity="0.8"
              className={isAnimated ? 'animate-pulse' : ''}
            />
          )}

          {/* DYNAMIC ATTACK VISUALS & ENERGY SWEEPS */}
          {/* 1. Punch Attack Trail & Shockwave Ring */}
          {currentAction === 'punch' && (
            <g transform="translate(42, -50)">
              {/* Velocity Streaks */}
              <line x1="-20" y1="-8" x2="35" y2="-8" stroke={glowColor} strokeWidth="3.5" strokeLinecap="round" opacity="0.9" filter={`url(#filter_glow_${fighter.id})`} />
              <line x1="-10" y1="4" x2="25" y2="4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <line x1="-15" y1="-18" x2="20" y2="-18" stroke={accentColor} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              {/* Energy Impact Burst */}
              <circle cx="30" cy="-8" r="14" fill="none" stroke={glowColor} strokeWidth="2.5" opacity="0.85" className="animate-ping" />
              <circle cx="30" cy="-8" r="6" fill="#ffffff" />
            </g>
          )}

          {/* 2. Kick Crescent Blade Trail */}
          {currentAction === 'kick' && (
            <g transform="translate(30, -35)">
              {/* Glowing Crescent Arc */}
              <path
                d="M -15 25 Q 45 10 50 -45 Q 35 5 -15 25 Z"
                fill={glowColor}
                opacity="0.75"
                filter={`url(#filter_glow_${fighter.id})`}
              />
              <path
                d="M -5 20 Q 40 5 45 -40"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* 3. Special Ability Ultra Aura & Energy Flare */}
          {currentAction === 'special' && (
            <g transform="translate(0, -60)">
              {/* Radiating Energy Nova */}
              <circle cx="0" cy="0" r="48" fill="none" stroke={glowColor} strokeWidth="3" strokeDasharray="12 6" className="animate-spin" style={{ animationDuration: '1.2s' }} />
              <circle cx="0" cy="0" r="62" fill="none" stroke={accentColor} strokeWidth="2" strokeDasharray="8 4" className="animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              {/* Power Corona */}
              <ellipse cx="0" cy="0" rx="35" ry="55" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" className="animate-pulse" />
              {/* Ground Rupture Light */}
              <ellipse cx="0" cy="62" rx="45" ry="8" fill={glowColor} opacity="0.6" filter={`url(#filter_glow_${fighter.id})`} />
            </g>
          )}

          {/* 4. Footstep Walk Dust Puffs */}
          {(currentAction === 'walk_forward' || currentAction === 'walk_back') && (
            <g transform="translate(-18, 12)" opacity="0.7">
              <ellipse cx="0" cy="0" rx="8" ry="3" fill="rgba(148,163,184,0.5)" className="animate-ping" />
              <circle cx="-6" cy="-2" r="3" fill="rgba(203,213,225,0.4)" />
            </g>
          )}

          {/* Guard Barrier Shield (when blocking - capped at 5 seconds) */}
          {currentAction === 'block' && (() => {
            const blockDur = combatState?.blockDuration || 0;
            const remaining = Math.max(0, 5.0 - blockDur);
            const isCritical = remaining <= 1.5;
            const isWarning = remaining <= 2.8;
            const shieldStroke = isCritical ? '#ef4444' : (isWarning ? '#f59e0b' : '#22d3ee');
            const shieldFill = isCritical ? 'rgba(239, 68, 68, 0.45)' : (isWarning ? 'rgba(245, 158, 11, 0.35)' : 'rgba(6, 182, 212, 0.35)');

            return (
              <g transform="translate(24, -60)">
                <polygon
                  points="0,-48 24,-22 24,28 0,48 -8,28 -8,-22"
                  fill={shieldFill}
                  stroke={shieldStroke}
                  strokeWidth={isCritical ? "4" : "3"}
                  className={isCritical ? 'animate-ping' : (isWarning ? 'animate-pulse' : '')}
                />
                <line x1="0" y1="-32" x2="18" y2="0" stroke={shieldStroke} strokeWidth="2" />
                <line x1="18" y1="0" x2="0" y2="32" stroke={shieldStroke} strokeWidth="2" />

                {/* Fracture cracks when near 5-second break */}
                {isWarning && (
                  <path
                    d="M 6 -20 L 14 -10 L 8 4 L 16 16"
                    stroke={shieldStroke}
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.85"
                  />
                )}

                {/* 5-second countdown readout */}
                <text
                  x="8"
                  y="4"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                >
                  {remaining.toFixed(1)}s
                </text>
              </g>
            );
          })()}
        </g>
      </svg>
    </div>
  );
};
