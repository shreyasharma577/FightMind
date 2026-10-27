export interface ArenaDefinition {
  id: string;
  name: string;
  subtitle: string;
  theme: 'cyberpunk' | 'reactor' | 'temple' | 'orbital';
  skyGradient: [string, string];
  groundColor: string;
  gridLineColor: string;
  accentGlow: string;
  ambientLight: string;
  particleType: 'sparks' | 'embers' | 'petals' | 'stardust';
  sceneryLayers: {
    back: string;
    mid: string;
    front: string;
  };
}

export const ARENAS: ArenaDefinition[] = [
  {
    id: 'neo_tokyo',
    name: 'Neo Shinjuku Rooftop',
    subtitle: 'Rain-slick helipad overlooking the neon metropolis',
    theme: 'cyberpunk',
    skyGradient: ['#090d16', '#1a103c'],
    groundColor: '#111827',
    gridLineColor: 'rgba(6, 182, 212, 0.25)',
    accentGlow: '#06b6d4',
    ambientLight: 'rgba(59, 130, 246, 0.15)',
    particleType: 'sparks',
    sceneryLayers: {
      back: 'skyscrapers',
      mid: 'holograms',
      front: 'helipad_rails'
    }
  },
  {
    id: 'abyssal_reactor',
    name: 'Sub-Zero Reactor Core',
    subtitle: 'Underground geothermal antimatter facility',
    theme: 'reactor',
    skyGradient: ['#0b1320', '#1c1917'],
    groundColor: '#1c1917',
    gridLineColor: 'rgba(239, 68, 68, 0.3)',
    accentGlow: '#ef4444',
    ambientLight: 'rgba(239, 68, 68, 0.12)',
    particleType: 'embers',
    sceneryLayers: {
      back: 'reactor_pipes',
      mid: 'coolant_tanks',
      front: 'hazard_floor'
    }
  },
  {
    id: 'celestial_temple',
    name: 'Shrine of the Whispering Wind',
    subtitle: 'Floating mountain ruins steeped in ancient spirits',
    theme: 'temple',
    skyGradient: ['#1e1b4b', '#4c1d95'],
    groundColor: '#0f172a',
    gridLineColor: 'rgba(168, 85, 247, 0.25)',
    accentGlow: '#a855f7',
    ambientLight: 'rgba(168, 85, 247, 0.15)',
    particleType: 'petals',
    sceneryLayers: {
      back: 'floating_islands',
      mid: 'torii_gates',
      front: 'stone_platforms'
    }
  },
  {
    id: 'solar_orbital',
    name: 'Apex Orbital Ring',
    subtitle: 'Low-orbit ring station above planetary dawn',
    theme: 'orbital',
    skyGradient: ['#020617', '#0f172a'],
    groundColor: '#0b1120',
    gridLineColor: 'rgba(234, 179, 8, 0.25)',
    accentGlow: '#eab308',
    ambientLight: 'rgba(234, 179, 8, 0.12)',
    particleType: 'stardust',
    sceneryLayers: {
      back: 'planet_curvature',
      mid: 'solar_arrays',
      front: 'station_gantry'
    }
  }
];
