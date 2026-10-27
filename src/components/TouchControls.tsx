import React from 'react';

interface TouchControlsProps {
  onInput: (action: string, isPressed: boolean) => void;
  canSpecial: boolean;
  isBlockExhausted?: boolean;
  blockRemaining?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInput,
  canSpecial,
  isBlockExhausted = false,
  blockRemaining = 5.0
}) => {
  const handleTouch = (action: string, pressed: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onInput(action, pressed);
  };

  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none z-30 flex items-end justify-between px-4 md:px-10 max-w-5xl mx-auto">
      {/* DIRECTIONAL D-PAD */}
      <div className="pointer-events-auto flex flex-col items-center gap-1 select-none">
        {/* UP / JUMP */}
        <button
          onTouchStart={handleTouch('up', true)}
          onTouchEnd={handleTouch('up', false)}
          onMouseDown={handleTouch('up', true)}
          onMouseUp={handleTouch('up', false)}
          className="w-14 h-12 bg-slate-900/80 active:bg-cyan-500/30 border border-slate-700/80 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-300 font-mono font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          ▲ JUMP
        </button>

        {/* LEFT & RIGHT */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={handleTouch('left', true)}
            onTouchEnd={handleTouch('left', false)}
            onMouseDown={handleTouch('left', true)}
            onMouseUp={handleTouch('left', false)}
            className="w-14 h-12 bg-slate-900/80 active:bg-cyan-500/30 border border-slate-700/80 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-300 font-mono font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-transform"
          >
            ◀
          </button>
          <button
            onTouchStart={handleTouch('down', true)}
            onTouchEnd={handleTouch('down', false)}
            onMouseDown={handleTouch('down', true)}
            onMouseUp={handleTouch('down', false)}
            className="w-12 h-12 bg-slate-900/80 active:bg-cyan-500/30 border border-slate-700/80 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-400 font-mono font-bold text-[10px] cursor-pointer shadow-lg active:scale-95 transition-transform"
          >
            ▼
          </button>
          <button
            onTouchStart={handleTouch('right', true)}
            onTouchEnd={handleTouch('right', false)}
            onMouseDown={handleTouch('right', true)}
            onMouseUp={handleTouch('right', false)}
            className="w-14 h-12 bg-slate-900/80 active:bg-cyan-500/30 border border-slate-700/80 active:border-cyan-400 rounded-lg flex items-center justify-center text-slate-300 font-mono font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-transform"
          >
            ▶
          </button>
        </div>
      </div>

      {/* COMBAT ACTION BUTTONS */}
      <div className="pointer-events-auto grid grid-cols-2 gap-2 select-none">
        {/* BLOCK (5s MAX DURATION) */}
        <button
          onTouchStart={handleTouch('block', true)}
          onTouchEnd={handleTouch('block', false)}
          onMouseDown={handleTouch('block', true)}
          onMouseUp={handleTouch('block', false)}
          disabled={isBlockExhausted}
          className={`w-16 h-14 rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform ${
            isBlockExhausted
              ? 'bg-rose-950/40 border border-rose-800 opacity-60'
              : 'bg-blue-950/80 active:bg-blue-600/50 border border-blue-500/60'
          }`}
        >
          <span className={`font-display font-black text-sm ${isBlockExhausted ? 'text-rose-400' : 'text-blue-300'}`}>
            {isBlockExhausted ? 'BROKEN' : 'BLOCK'}
          </span>
          <span className="text-[9px] font-mono text-blue-400/60">
            {isBlockExhausted ? 'COOLDOWN' : `${blockRemaining.toFixed(1)}s`}
          </span>
        </button>

        {/* SPECIAL */}
        <button
          onTouchStart={handleTouch('special', true)}
          onTouchEnd={handleTouch('special', false)}
          onMouseDown={handleTouch('special', true)}
          onMouseUp={handleTouch('special', false)}
          className={`w-16 h-14 rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform ${
            canSpecial
              ? 'bg-amber-600/80 border-2 border-amber-300 animate-pulse shadow-[0_0_15px_#f59e0b]'
              : 'bg-slate-900/60 border border-slate-800 opacity-60'
          }`}
        >
          <span className={`font-display font-black text-sm ${canSpecial ? 'text-amber-100' : 'text-slate-400'}`}>
            SPECIAL
          </span>
          <span className="text-[9px] font-mono text-amber-200/60">L</span>
        </button>

        {/* PUNCH */}
        <button
          onTouchStart={handleTouch('punch', true)}
          onTouchEnd={handleTouch('punch', false)}
          onMouseDown={handleTouch('punch', true)}
          onMouseUp={handleTouch('punch', false)}
          className="w-16 h-14 bg-cyan-950/80 active:bg-cyan-600/50 border border-cyan-500/60 rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <span className="font-display font-black text-sm text-cyan-300">PUNCH</span>
          <span className="text-[9px] font-mono text-cyan-400/60">J</span>
        </button>

        {/* KICK */}
        <button
          onTouchStart={handleTouch('kick', true)}
          onTouchEnd={handleTouch('kick', false)}
          onMouseDown={handleTouch('kick', true)}
          onMouseUp={handleTouch('kick', false)}
          className="w-16 h-14 bg-rose-950/80 active:bg-rose-600/50 border border-rose-500/60 rounded-xl flex flex-col items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <span className="font-display font-black text-sm text-rose-300">KICK</span>
          <span className="text-[9px] font-mono text-rose-400/60">K</span>
        </button>
      </div>
    </div>
  );
};
