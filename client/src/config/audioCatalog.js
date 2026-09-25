/**
 * StudyHive Curated Lo-Fi Audio Catalog
 *
 * Sourcing & Licensing:
 * - Default tracks use CC0 / Royalty-Free Public Domain ambient compositions
 *   tailored for focus, reading, and deep study.
 * - Supports custom user tracks: simply drop your favorite `.mp3` or `.ogg` files into
 *   `client/public/audio/tracks/` and reference them here.
 * - Also includes a built-in Web Audio procedural lo-fi generator (warm Rhodes chords,
 *   subtle vinyl crackle, and soft rainfall) that works 100% offline.
 */

export const LOFI_TRACKS = [
  {
    id: 'track_rain_chords',
    title: 'Cozy Rain & Chords',
    artist: 'StudyHive Archive',
    genre: 'Lo-Fi Chill & Rain',
    duration: '2:45',
    src: '/audio/tracks/cozy-rain-chords.mp3',
    license: 'CC0 / Public Domain (Royalty-Free)',
    synthPreset: 'rainChords', // Web Audio fallback preset
  },
  {
    id: 'track_honey_library',
    title: 'Honey Library Beats',
    artist: 'Amber Lounge',
    genre: 'Mellow Study Hop',
    duration: '3:10',
    src: '/audio/tracks/honey-library-lofi.mp3',
    license: 'CC0 / Public Domain (Royalty-Free)',
    synthPreset: 'honeyLibrary',
  },
  {
    id: 'track_hearthside',
    title: 'Hearthside Fireside',
    artist: 'Oak & Parchment',
    genre: 'Acoustic Warmth & Vinyl',
    duration: '2:55',
    src: '/audio/tracks/warm-hearth-chill.mp3',
    license: 'CC0 / Public Domain (Royalty-Free)',
    synthPreset: 'hearthside',
  },
  {
    id: 'track_midnight_flow',
    title: 'Midnight Study Flow',
    artist: 'Retro Bee',
    genre: 'Deep Focus Ambient',
    duration: '3:30',
    src: '/audio/tracks/midnight-study-flow.mp3',
    license: 'CC0 / Public Domain (Royalty-Free)',
    synthPreset: 'midnightFlow',
  },
];
