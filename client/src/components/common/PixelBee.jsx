import React from 'react';

/**
 * PixelBee: A handcrafted pixel-art bee mascot with wing-flapping animation
 * and optional mood / accessory props.
 */
export const PixelBee = ({ size = 64, className = '', animated = true }) => {
  return (
    <div
      className={`inline-block select-none ${animated ? 'animate-float' : ''} ${className}`}
      style={{ width: size, height: size }}
      title="StudyHive Mascot"
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="crisp-edges"
      >
        {/* Antennas */}
        <rect x="7" y="2" width="2" height="3" fill="#1E1B18" />
        <rect x="5" y="1" width="2" height="2" fill="#D97706" />
        <rect x="15" y="2" width="2" height="3" fill="#1E1B18" />
        <rect x="17" y="1" width="2" height="2" fill="#D97706" />

        {/* Wings (Left & Right) with gentle flutter */}
        <g className={animated ? 'animate-buzz' : ''}>
          <rect x="3" y="5" width="4" height="4" fill="#E0F2FE" fillOpacity="0.85" />
          <rect x="4" y="4" width="3" height="1" fill="#BAE6FD" />
          <rect x="17" y="5" width="4" height="4" fill="#E0F2FE" fillOpacity="0.85" />
          <rect x="17" y="4" width="3" height="1" fill="#BAE6FD" />
        </g>

        {/* Bee Body (Main oval shape: 16x12) */}
        {/* Head and Base Yellow */}
        <rect x="6" y="6" width="12" height="12" fill="#FBBF24" />
        <rect x="7" y="5" width="10" height="1" fill="#FBBF24" />
        <rect x="7" y="18" width="10" height="1" fill="#FBBF24" />

        {/* Dark Stripes */}
        <rect x="9" y="6" width="2" height="12" fill="#1E1B18" />
        <rect x="13" y="6" width="2" height="12" fill="#1E1B18" />

        {/* Stinger */}
        <rect x="18" y="11" width="2" height="2" fill="#1E1B18" />
        <rect x="20" y="11" width="1" height="2" fill="#451A03" />

        {/* Face / Eyes */}
        <rect x="7" y="9" width="2" height="3" fill="#1E1B18" />
        <rect x="7" y="9" width="1" height="1" fill="#FFFFFF" />

        {/* Cute Pink Blush */}
        <rect x="6" y="12" width="2" height="1" fill="#F43F5E" />
        <rect x="6" y="13" width="1" height="1" fill="#FB7185" />

        {/* Tiny Smile */}
        <rect x="7" y="14" width="2" height="1" fill="#92400E" />

        {/* Honey Drop Accent on head */}
        <rect x="10" y="4" width="2" height="2" fill="#F59E0B" />
        <rect x="11" y="3" width="1" height="1" fill="#FEF08A" />

        {/* Tiny Legs */}
        <rect x="9" y="18" width="2" height="2" fill="#1E1B18" />
        <rect x="13" y="18" width="2" height="2" fill="#1E1B18" />
      </svg>
    </div>
  );
};
