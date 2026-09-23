import React from 'react';

/**
 * PixelAvatar: A modular, layered pixel-art avatar renderer that supports
 * dynamic hair, outfits, accessories, and scale.
 */
export const PixelAvatar = ({
  size = 64,
  equipped = {},
  animated = true,
  className = '',
}) => {
  const hair = equipped?.hair || 'hair_curly';
  const outfit = equipped?.outfit || 'outfit_sweater';
  const accessory = equipped?.accessory || 'acc_glasses';

  return (
    <div
      className={`inline-block select-none ${animated ? 'animate-float' : ''} ${className}`}
      style={{ width: size, height: size }}
      title="Custom Pixel Bee Avatar"
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="crisp-edges"
      >
        {/* Antennas (Base) */}
        <rect x="7" y="2" width="2" height="3" fill="#1E1B18" />
        <rect x="5" y="1" width="2" height="2" fill="#D97706" />
        <rect x="15" y="2" width="2" height="3" fill="#1E1B18" />
        <rect x="17" y="1" width="2" height="2" fill="#D97706" />

        {/* Wings (with gentle flutter) */}
        <g className={animated ? 'animate-buzz' : ''}>
          <rect x="3" y="5" width="4" height="4" fill="#E0F2FE" fillOpacity="0.85" />
          <rect x="4" y="4" width="3" height="1" fill="#BAE6FD" />
          <rect x="17" y="5" width="4" height="4" fill="#E0F2FE" fillOpacity="0.85" />
          <rect x="17" y="4" width="3" height="1" fill="#BAE6FD" />
        </g>

        {/* Bee Body (Yellow Base) */}
        <rect x="6" y="6" width="12" height="12" fill="#FBBF24" />
        <rect x="7" y="5" width="10" height="1" fill="#FBBF24" />
        <rect x="7" y="18" width="10" height="1" fill="#FBBF24" />

        {/* Stripes */}
        <rect x="9" y="6" width="2" height="12" fill="#1E1B18" />
        <rect x="13" y="6" width="2" height="12" fill="#1E1B18" />

        {/* Stinger & Tiny Legs */}
        <rect x="18" y="11" width="2" height="2" fill="#1E1B18" />
        <rect x="20" y="11" width="1" height="2" fill="#451A03" />
        <rect x="9" y="18" width="2" height="2" fill="#1E1B18" />
        <rect x="13" y="18" width="2" height="2" fill="#1E1B18" />

        {/* Face Elements */}
        {/* Eyes */}
        <rect x="7" y="9" width="2" height="3" fill="#1E1B18" />
        <rect x="7" y="9" width="1" height="1" fill="#FFFFFF" />

        {/* Pink Blush */}
        <rect x="6" y="12" width="2" height="1" fill="#F43F5E" />
        <rect x="6" y="13" width="1" height="1" fill="#FB7185" />

        {/* Tiny Smile */}
        <rect x="7" y="14" width="2" height="1" fill="#92400E" />

        {/* ----------------- LAYER 1: OUTFIT ----------------- */}
        {outfit === 'outfit_sweater' && (
          /* Honey Knit Sweater */
          <g>
            <rect x="8" y="15" width="8" height="3" fill="#D97706" />
            <rect x="9" y="14" width="6" height="1" fill="#F59E0B" />
            <rect x="10" y="15" width="1" height="3" fill="#B45309" />
            <rect x="13" y="15" width="1" height="3" fill="#B45309" />
          </g>
        )}

        {outfit === 'outfit_vest' && (
          /* Academic Cardigan / Vest */
          <g>
            <rect x="8" y="15" width="8" height="3" fill="#451A03" />
            <rect x="10" y="14" width="4" height="2" fill="#FFFDF7" />
            <rect x="11" y="16" width="2" height="2" fill="#78350F" />
          </g>
        )}

        {outfit === 'outfit_bee_hoodie' && (
          /* Striped Bee Hoodie */
          <g>
            <rect x="8" y="14" width="8" height="4" fill="#1E1B18" />
            <rect x="9" y="16" width="6" height="1" fill="#FACC15" />
            <rect x="11" y="14" width="2" height="2" fill="#FEF08A" />
          </g>
        )}

        {outfit === 'outfit_dungarees' && (
          /* Corduroy Overalls */
          <g>
            <rect x="8" y="15" width="8" height="3" fill="#1E3A8A" />
            <rect x="9" y="14" width="1" height="2" fill="#2563EB" />
            <rect x="14" y="14" width="1" height="2" fill="#2563EB" />
            <rect x="9" y="15" width="1" height="1" fill="#E2E8F0" />
            <rect x="14" y="15" width="1" height="1" fill="#E2E8F0" />
          </g>
        )}

        {outfit === 'outfit_royal_bee' && (
          /* Queen Bee Robes */
          <g>
            <rect x="7" y="14" width="10" height="4" fill="#991B1B" />
            <rect x="7" y="14" width="10" height="1" fill="#F59E0B" />
            <rect x="11" y="15" width="2" height="3" fill="#FEF08A" />
          </g>
        )}

        {/* ----------------- LAYER 2: HAIR ----------------- */}
        {hair === 'hair_curly' && (
          /* Cozy Curls */
          <g>
            <rect x="6" y="4" width="5" height="2" fill="#78350F" />
            <rect x="12" y="4" width="5" height="2" fill="#78350F" />
            <rect x="5" y="6" width="2" height="3" fill="#78350F" />
            <rect x="16" y="6" width="2" height="3" fill="#78350F" />
          </g>
        )}

        {hair === 'hair_bob' && (
          /* Librarian Bob */
          <g>
            <rect x="6" y="4" width="12" height="2" fill="#5A260B" />
            <rect x="5" y="6" width="2" height="5" fill="#5A260B" />
            <rect x="16" y="6" width="2" height="5" fill="#5A260B" />
          </g>
        )}

        {hair === 'hair_ponytail' && (
          /* High Ponytail */
          <g>
            <rect x="7" y="4" width="9" height="2" fill="#92400E" />
            <rect x="15" y="3" width="3" height="3" fill="#B45309" />
            <rect x="17" y="5" width="2" height="4" fill="#92400E" />
          </g>
        )}

        {hair === 'hair_beanie' && (
          /* Winter Beanie */
          <g>
            <rect x="6" y="2" width="12" height="4" fill="#D97706" />
            <rect x="5" y="5" width="14" height="2" fill="#B45309" />
            <rect x="11" y="1" width="2" height="1" fill="#FEF3C7" />
          </g>
        )}

        {hair === 'hair_bee_antenna' && (
          /* Golden Bee Antennae */
          <g>
            <rect x="5" y="0" width="3" height="3" fill="#F59E0B" />
            <rect x="6" y="1" width="1" height="1" fill="#FEF08A" />
            <rect x="16" y="0" width="3" height="3" fill="#F59E0B" />
            <rect x="17" y="1" width="1" height="1" fill="#FEF08A" />
          </g>
        )}

        {/* ----------------- LAYER 3: ACCESSORIES ----------------- */}
        {accessory === 'acc_glasses' && (
          /* Round Tortoise Glasses */
          <g>
            <rect x="6" y="8" width="4" height="4" stroke="#78350F" strokeWidth="1" fill="none" />
            <rect x="10" y="9" width="2" height="1" fill="#78350F" />
            <rect x="7" y="9" width="2" height="2" fill="#93C5FD" fillOpacity="0.4" />
          </g>
        )}

        {accessory === 'acc_flower' && (
          /* Amber Daisy Clip */
          <g>
            <rect x="15" y="5" width="3" height="3" fill="#F59E0B" />
            <rect x="16" y="6" width="1" height="1" fill="#FFFDF7" />
          </g>
        )}

        {accessory === 'acc_scarf' && (
          /* Cozy Wool Scarf */
          <g>
            <rect x="6" y="14" width="11" height="2" fill="#DC2626" />
            <rect x="7" y="14" width="2" height="2" fill="#FEF3C7" />
            <rect x="11" y="14" width="2" height="2" fill="#FEF3C7" />
            <rect x="6" y="16" width="3" height="3" fill="#DC2626" />
          </g>
        )}

        {accessory === 'acc_crown' && (
          /* Honeycomb Crown */
          <g>
            <rect x="7" y="3" width="10" height="2" fill="#F59E0B" />
            <rect x="8" y="1" width="2" height="2" fill="#F59E0B" />
            <rect x="11" y="0" width="2" height="3" fill="#FBBF24" />
            <rect x="14" y="1" width="2" height="2" fill="#F59E0B" />
            <rect x="11" y="1" width="2" height="1" fill="#FFFBEB" />
          </g>
        )}
      </svg>
    </div>
  );
};
