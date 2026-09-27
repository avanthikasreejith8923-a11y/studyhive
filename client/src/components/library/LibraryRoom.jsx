import React from 'react';
import { PixelBee } from '../common/PixelBee';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { DeskDecorRenderer } from './DeskDecorRenderer';
import { Sparkles, Armchair, Coffee, BookOpen, Sun, Flame } from 'lucide-react';

export const DESKS_CONFIG = [
  {
    id: 'desk_window',
    name: 'The Window Alcove',
    icon: '🌧️',
    description: 'Overlooking the rainy cobblestone garden with gentle ambient drizzle.',
    props: { type: 'window', plant: 'fern' },
    defaultOccupant: null, // Open for user
  },
  {
    id: 'desk_oak',
    name: 'The Grand Oak Table',
    icon: '📚',
    description: 'Sturdy polished oak desk with an antique brass banker’s lamp.',
    props: { type: 'lamp', decor: 'quill' },
    defaultOccupant: {
      username: 'Maya',
      subject: 'World History',
      avatarColor: '#F59E0B',
    },
  },
  {
    id: 'desk_hearth',
    name: 'The Fireplace Hearth',
    icon: '🔥',
    description: 'Cozy wingback chair beside a crackling warm stone fireplace.',
    props: { type: 'fireplace', decor: 'tea' },
    defaultOccupant: null, // Open for user
  },
  {
    id: 'desk_nook',
    name: 'The Bookshelf Nook',
    icon: '📖',
    description: 'Tucked quietly between antique leather-bound encyclopedia rows.',
    props: { type: 'bookshelf', decor: 'lantern' },
    defaultOccupant: {
      username: 'Sam',
      subject: 'Python Code',
      avatarColor: '#10B981',
    },
  },
  {
    id: 'desk_botanical',
    name: 'The Botanical Corner',
    icon: '🌿',
    description: 'Surrounded by blooming jasmine, hanging ivy, and a sweet honey jar.',
    props: { type: 'plant', decor: 'honey' },
    defaultOccupant: null, // Open for user
  },
];

export const LibraryRoom = ({
  activeSession,
  currentUser,
  onSelectDesk,
}) => {
  return (
    <div className="pixel-panel bg-cream-100 overflow-hidden shadow-pixel-lg">
      {/* Room Header / Plaque */}
      <div className="pixel-panel-header">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏛️</span>
          <span className="font-pixel text-[11px] text-oak-900">
            THE ARCHIVAL STUDY HALL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block bg-honey-200 border border-pixel-border px-2 py-0.5 font-sans text-[11px] font-semibold text-oak-800">
            Quiet Study Zone 🤫
          </span>
          <span className="bg-cream-50 border border-pixel-border px-2 py-0.5 font-pixel text-[9px] text-oak-700">
            {activeSession ? 'SEATED AT DESK' : 'DESK SELECTION'}
          </span>
        </div>
      </div>

      {/* Library Visual Environment */}
      <div className="p-4 sm:p-5 relative bg-[#EFE3C3] border-b-4 border-pixel-border">
        {/* Bookshelf Wall Background Pattern (Pixel SVG style) */}
        <div className="relative mb-5 bg-[#78350F] border-3 border-pixel-border p-3 shadow-pixel-sm overflow-hidden">
          {/* Bookshelf Top Molding */}
          <div className="h-2 bg-[#92400E] border-b-2 border-pixel-border -mx-3 -mt-3 mb-2 flex items-center justify-around">
            <div className="w-8 h-1 bg-[#B45309]" />
            <div className="w-8 h-1 bg-[#B45309]" />
            <div className="w-8 h-1 bg-[#B45309]" />
          </div>

          {/* Row of Pixel Books & Library Props */}
          <div className="flex items-end justify-between gap-1 overflow-x-auto py-1">
            {/* Shelf section 1: Books */}
            <div className="flex items-end gap-1">
              <div className="w-3 h-10 bg-[#B91C1C] border border-pixel-border" title="Ancient Volume I" />
              <div className="w-2.5 h-12 bg-[#D97706] border border-pixel-border" />
              <div className="w-4 h-9 bg-[#1E3A8A] border border-pixel-border" />
              <div className="w-3 h-11 bg-[#14532D] border border-pixel-border" />
              <div className="w-3.5 h-8 bg-[#451A03] border border-pixel-border" />
            </div>

            {/* Vintage Library Clock / Lantern */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-honey-400 border-2 border-pixel-border rounded-xs shadow-pixel-sm flex items-center justify-center text-[10px]">
                🕰️
              </div>
              <div className="w-2 h-2 bg-[#451A03]" />
            </div>

            {/* Shelf section 2: More books + Plant */}
            <div className="flex items-end gap-1">
              <div className="w-4 h-11 bg-[#7C2D12] border border-pixel-border" />
              <div className="w-3 h-8 bg-[#047857] border border-pixel-border" />
              <div className="w-2.5 h-10 bg-[#F59E0B] border border-pixel-border" />
              <div className="w-5 h-7 bg-amber-200 border border-pixel-border flex items-center justify-center text-[10px]">
                🌿
              </div>
              <div className="w-3 h-12 bg-[#312E81] border border-pixel-border" />
            </div>

            {/* Hanging ivy decoration */}
            <div className="hidden sm:flex items-end gap-1">
              <div className="w-3 h-9 bg-[#9A3412] border border-pixel-border" />
              <div className="w-2.5 h-11 bg-[#15803D] border border-pixel-border" />
              <div className="w-3.5 h-10 bg-[#B45309] border border-pixel-border" />
            </div>
          </div>

          {/* Warm Wall Sconce Lamps Lighting Effect */}
          <div className="absolute top-1 left-8 w-6 h-6 bg-yellow-300/30 rounded-full blur-xs pointer-events-none" />
          <div className="absolute top-1 right-8 w-6 h-6 bg-yellow-300/30 rounded-full blur-xs pointer-events-none" />
        </div>

        {/* Floor Section: Desks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {DESKS_CONFIG.map((desk) => {
            const isUserHere = activeSession && activeSession.deskId === desk.id;
            const isPlaceholderOccupied = !isUserHere && desk.defaultOccupant;
            const isOpen = !isUserHere && !isPlaceholderOccupied;

            return (
              <div
                key={desk.id}
                role={isOpen ? 'button' : undefined}
                tabIndex={isOpen ? 0 : undefined}
                aria-label={
                  isUserHere
                    ? `Your active study desk: ${desk.name}`
                    : isOpen
                    ? `Claim ${desk.name} - Open desk for studying`
                    : `${desk.name} - Occupied by ${desk.defaultOccupant?.username || 'another scholar'}`
                }
                onClick={() => {
                  if (isOpen) {
                    onSelectDesk(desk);
                  }
                }}
                onKeyDown={(e) => {
                  if (isOpen && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectDesk(desk);
                  }
                }}
                className={`relative p-3.5 border-3 transition-all duration-100 select-none ${
                  isUserHere
                    ? 'bg-amber-100 border-honey-600 shadow-pixel ring-2 ring-honey-500'
                    : isOpen
                    ? 'bg-cream-50 border-pixel-border shadow-pixel hover:-translate-y-0.5 hover:shadow-pixel-lg cursor-pointer hover:bg-white focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none'
                    : 'bg-cream-200/80 border-pixel-border/70 shadow-pixel-sm opacity-90'
                }`}
              >
                {/* Desk Header / Status Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl" title={desk.name}>{desk.icon}</span>
                  {isUserHere ? (
                    <span className="bg-emerald-600 text-white font-pixel text-[8px] px-2 py-0.5 border border-pixel-border shadow-pixel-sm animate-pulse">
                      YOU'RE HERE 🐝
                    </span>
                  ) : isPlaceholderOccupied ? (
                    <span className="bg-oak-700 text-cream-100 font-pixel text-[8px] px-1.5 py-0.5 border border-pixel-border">
                      OCCUPIED
                    </span>
                  ) : (
                    <span className="bg-honey-400 text-oak-900 font-pixel text-[8px] px-1.5 py-0.5 border border-pixel-border shadow-pixel-sm">
                      OPEN SEAT
                    </span>
                  )}
                </div>

                {/* Desk Name */}
                <h4 className="font-pixel text-[10px] text-oak-900 mb-1 truncate">
                  {desk.name}
                </h4>

                {/* Desk Visual & Occupant Seat */}
                <div className="my-2 bg-[#D4C3A3] border-2 border-pixel-border p-2.5 flex items-center justify-center min-h-[90px] relative">
                  {/* Table Surface Representation */}
                  <div className="absolute inset-x-2 bottom-1.5 h-3 bg-[#92400E] border border-pixel-border shadow-inner" />
                  
                  {isUserHere ? (
                    /* User's Live Animated Bee Avatar with Equipped Clothes & Desk Decor */
                    <div className="flex flex-col items-center z-10 relative">
                      <PixelAvatar
                        size={46}
                        equipped={currentUser?.equippedItems}
                        animated={true}
                      />
                      <div className="bg-honey-500 border border-pixel-border px-1.5 py-0.2 mt-1 shadow-pixel-sm">
                        <span className="font-pixel text-[8px] text-oak-900 truncate max-w-[90px] block">
                          {currentUser?.username || 'You'}
                        </span>
                      </div>
                      {/* Equipped Desk Decoration placed on desk surface */}
                      <div className="absolute -bottom-1 -right-8 z-20">
                        <DeskDecorRenderer
                          decorId={currentUser?.equippedItems?.deskDecor}
                          size={22}
                        />
                      </div>
                    </div>
                  ) : isPlaceholderOccupied ? (
                    /* Static Co-Worker Bee */
                    <div className="flex flex-col items-center z-10 opacity-90 relative">
                      <PixelAvatar
                        size={38}
                        equipped={{
                          hair: desk.id === 'desk_oak' ? 'hair_bob' : 'hair_ponytail',
                          outfit: desk.id === 'desk_oak' ? 'outfit_vest' : 'outfit_sweater',
                          accessory: desk.id === 'desk_oak' ? 'acc_glasses' : 'acc_flower',
                        }}
                        animated={false}
                      />
                      <div className="bg-cream-100 border border-pixel-border px-1.5 py-0.2 mt-1">
                        <span className="font-sans text-[10px] font-semibold text-oak-800">
                          {desk.defaultOccupant.username} 🐝
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-7 z-20">
                        <DeskDecorRenderer decorId="decor_mug" size={18} />
                      </div>
                    </div>
                  ) : (
                    /* Empty Chair & Desk Ready */
                    <div className="flex flex-col items-center z-10 text-oak-600 group">
                      <div className="w-9 h-9 border-2 border-dashed border-oak-600/70 bg-cream-100/60 rounded flex items-center justify-center">
                        <Armchair size={18} className="text-oak-700" />
                      </div>
                      <span className="font-pixel text-[8px] text-honey-800 mt-1.5 group-hover:scale-105 transition-transform">
                        + CLAIM DESK
                      </span>
                    </div>
                  )}
                </div>

                {/* Active Subject or Description Tag */}
                <div className="text-[11px] font-sans truncate">
                  {isUserHere ? (
                    <div className="text-emerald-900 font-semibold flex items-center gap-1">
                      <span className="text-xs">📖</span>
                      <span className="truncate">{activeSession.subject}</span>
                    </div>
                  ) : isPlaceholderOccupied ? (
                    <div className="text-oak-600 truncate flex items-center gap-1">
                      <span>•</span>
                      <span>Studying {desk.defaultOccupant.subject}</span>
                    </div>
                  ) : (
                    <p className="text-oak-600 text-[11px] truncate">
                      {desk.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Room Footer Status Hint */}
      <div className="p-3 bg-cream-50 font-sans text-xs text-oak-700 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>
            {activeSession
              ? `Currently studying at ${activeSession.deskName || 'your desk'}. Focus timer is ticking!`
              : 'Click any open desk above to pick your subject and start focusing.'}
          </span>
        </div>
        <div className="text-oak-600 text-[11px]">
          3 of 5 Desks Available
        </div>
      </div>
    </div>
  );
};
