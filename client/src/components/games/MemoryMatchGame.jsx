import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Sparkles, Check, Flame } from 'lucide-react';

const CARD_PAIRS = [
  { icon: '🐝', name: 'Hive Bee' },
  { icon: '🍯', name: 'Honey Jar' },
  { icon: '📖', name: 'Library Book' },
  { icon: '☕', name: 'Warm Tea' },
  { icon: '🌿', name: 'Botanical Ivy' },
  { icon: '🕯️', name: 'Antique Lantern' },
  { icon: '🕰️', name: 'Grand Clock' },
  { icon: '👑', name: 'Queen Crown' },
];

/**
 * Gentle Web Audio sound effect for card flip & pair match
 */
const playCardSound = (type = 'flip') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'match') {
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.45);
      });
    }
  } catch (e) {}
};

const createDeck = () => {
  const deck = [];
  CARD_PAIRS.forEach((item, index) => {
    deck.push({ id: index * 2, pairId: index, icon: item.icon, name: item.name });
    deck.push({ id: index * 2 + 1, pairId: index, icon: item.icon, name: item.name });
  });

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const MemoryMatchGame = ({ isPaused = false }) => {
  const [cards, setCards] = useState(createDeck);
  const [flipped, setFlipped] = useState([]); // indices of currently face-up cards
  const [matched, setMatched] = useState([]); // array of pairIds that have been matched
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(() => {
    const saved = localStorage.getItem('studyhive_memory_best');
    return saved ? parseInt(saved, 10) : null;
  });

  const isWon = matched.length === CARD_PAIRS.length;

  const handleCardClick = (index) => {
    if (isPaused || isWon) return;
    if (flipped.includes(index) || matched.includes(cards[index].pairId)) return;
    if (flipped.length >= 2) return;

    playCardSound('flip');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.pairId === card2.pairId) {
        // Matched!
        setTimeout(() => {
          playCardSound('match');
          setMatched((prev) => {
            const next = [...prev, card1.pairId];
            if (next.length === CARD_PAIRS.length) {
              // Game Won!
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#F59E0B', '#FBBF24', '#FDE68A', '#10B981'],
              });
              const currentMoves = moves + 1;
              if (!bestMoves || currentMoves < bestMoves) {
                setBestMoves(currentMoves);
                localStorage.setItem('studyhive_memory_best', currentMoves.toString());
              }
            }
            return next;
          });
          setFlipped([]);
        }, 450);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  const resetGame = () => {
    setCards(createDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  return (
    <div className="space-y-4">
      {/* Stats Header Bar */}
      <div className="pixel-panel bg-cream-50 p-3 shadow-pixel-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-honey-200 border-2 border-pixel-border px-2.5 py-1 text-xs font-pixel text-honey-900 shadow-pixel-xs">
            MOVES: {moves}
          </div>
          <div className="bg-cream-200 border border-pixel-border px-2.5 py-1 text-xs font-pixel text-oak-800">
            PAIRS: {matched.length} / {CARD_PAIRS.length}
          </div>
          {bestMoves && (
            <div className="hidden sm:flex items-center gap-1 font-sans text-xs text-oak-600">
              <Trophy size={13} className="text-amber-600" />
              <span>Best: {bestMoves} moves</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="pixel-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-oak-800"
          title="Shuffle and start new card grid"
        >
          <RotateCcw size={12} />
          <span>RESTART</span>
        </button>
      </div>

      {/* 4x4 Cards Grid */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-md mx-auto p-3 bg-cream-200 border-3 border-pixel-border shadow-pixel">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx);
          const isCardMatched = matched.includes(card.pairId);
          const isFaceUp = isFlipped || isCardMatched;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`aspect-square cursor-pointer transition-all duration-200 select-none relative p-1 flex flex-col items-center justify-center text-center border-3 ${
                isCardMatched
                  ? 'bg-emerald-100 border-emerald-500 opacity-90 shadow-pixel-xs scale-98'
                  : isFaceUp
                  ? 'bg-amber-100 border-honey-600 shadow-pixel ring-1 ring-honey-400'
                  : 'bg-[#78350F] hover:bg-[#92400E] border-pixel-border shadow-pixel hover:-translate-y-0.5'
              }`}
            >
              {isFaceUp ? (
                <div className="flex flex-col items-center justify-center animate-fade-in">
                  <span className="text-2xl sm:text-3xl filter drop-shadow-xs">{card.icon}</span>
                  <span className="font-pixel text-[7px] sm:text-[8px] text-oak-900 mt-0.5 truncate max-w-full px-0.5 block">
                    {card.name}
                  </span>
                </div>
              ) : (
                /* Card Back */
                <div className="flex flex-col items-center justify-center text-honey-400">
                  <div className="w-5 h-5 rounded-xs border border-honey-500/50 flex items-center justify-center text-[10px]">
                    🐝
                  </div>
                  <div className="w-4 h-0.5 bg-honey-500/40 mt-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Win Celebration Banner */}
      {isWon && (
        <div className="pixel-panel p-4 bg-honey-100 border-3 border-honey-600 shadow-pixel text-center animate-bounce-gentle">
          <div className="text-3xl mb-1">🎉</div>
          <h3 className="font-pixel text-sm text-honey-900 mb-1">MEMORY CLEARED!</h3>
          <p className="font-sans text-xs text-oak-700 mb-3">
            You matched all 8 pairs in <span className="font-bold text-honey-800">{moves} moves</span>.
            Your mind is sharp and refreshed!
          </p>
          <button
            type="button"
            onClick={resetGame}
            className="pixel-btn-primary text-xs px-4 py-2"
          >
            PLAY AGAIN 🍯
          </button>
        </div>
      )}
    </div>
  );
};
