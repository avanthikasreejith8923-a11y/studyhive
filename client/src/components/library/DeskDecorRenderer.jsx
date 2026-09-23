import React from 'react';

/**
 * DeskDecorRenderer: Renders pixel-art desk decorations on the library study desks.
 */
export const DeskDecorRenderer = ({ decorId = 'decor_mug', size = 24, className = '' }) => {
  if (!decorId || decorId === 'decor_none') return null;

  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      title={decorId}
    >
      <svg
        viewBox="0 0 16 16"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="crisp-edges"
      >
        {decorId === 'decor_mug' && (
          /* Steaming Honey Mug */
          <g>
            {/* Steam puffs */}
            <rect x="5" y="1" width="1" height="2" fill="#E2E8F0" fillOpacity="0.7" />
            <rect x="8" y="0" width="1" height="2" fill="#E2E8F0" fillOpacity="0.7" />
            {/* Mug body */}
            <rect x="3" y="5" width="8" height="9" fill="#FFFBEB" stroke="#1E1B18" strokeWidth="1" />
            {/* Honey emblem on mug */}
            <rect x="6" y="8" width="2" height="3" fill="#F59E0B" />
            {/* Handle */}
            <rect x="11" y="7" width="2" height="5" fill="#FFFBEB" stroke="#1E1B18" strokeWidth="1" />
          </g>
        )}

        {decorId === 'decor_succulent' && (
          /* Potted Succulent */
          <g>
            {/* Pot */}
            <polygon points="4,9 12,9 11,15 5,15" fill="#B45309" stroke="#1E1B18" strokeWidth="1" />
            <rect x="3" y="8" width="10" height="2" fill="#78350F" />
            {/* Leaves */}
            <rect x="6" y="4" width="4" height="4" fill="#15803D" />
            <rect x="4" y="6" width="3" height="3" fill="#22C55E" />
            <rect x="9" y="6" width="3" height="3" fill="#22C55E" />
            <rect x="7" y="2" width="2" height="3" fill="#4ADE80" />
          </g>
        )}

        {decorId === 'decor_candle' && (
          /* Beeswax Candle */
          <g>
            {/* Flame */}
            <rect x="7" y="1" width="2" height="3" fill="#F59E0B" className="animate-pulse" />
            <rect x="7" y="2" width="2" height="1" fill="#FEF08A" />
            {/* Wick */}
            <rect x="7" y="4" width="2" height="2" fill="#1E1B18" />
            {/* Candle wax body */}
            <rect x="5" y="6" width="6" height="9" fill="#FEF3C7" stroke="#1E1B18" strokeWidth="1" />
            {/* Wax drips */}
            <rect x="4" y="8" width="1" height="3" fill="#FDE68A" />
          </g>
        )}

        {decorId === 'decor_trophy' && (
          /* Golden Scholar Trophy */
          <g>
            {/* Base */}
            <rect x="3" y="13" width="10" height="3" fill="#78350F" stroke="#1E1B18" strokeWidth="1" />
            <rect x="7" y="10" width="2" height="3" fill="#F59E0B" />
            {/* Trophy Cup */}
            <rect x="4" y="3" width="8" height="7" fill="#FBBF24" stroke="#1E1B18" strokeWidth="1" />
            {/* Handles */}
            <rect x="2" y="4" width="2" height="4" fill="#F59E0B" />
            <rect x="12" y="4" width="2" height="4" fill="#F59E0B" />
            {/* Star sparkle */}
            <rect x="7" y="5" width="2" height="2" fill="#FFFDF7" />
          </g>
        )}
      </svg>
    </div>
  );
};
