import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const TILE_STYLES = {
  2: 'bg-[#FEF3C7] text-oak-900 border-pixel-border',
  4: 'bg-[#FDE68A] text-oak-900 border-pixel-border',
  8: 'bg-[#FBBF24] text-oak-900 border-pixel-border font-bold',
  16: 'bg-[#F59E0B] text-white border-pixel-border font-bold',
  32: 'bg-[#D97706] text-white border-pixel-border font-bold',
  64: 'bg-[#B45309] text-white border-pixel-border font-bold shadow-pixel-xs',
  128: 'bg-[#9A3412] text-yellow-200 border-pixel-border font-bold shadow-pixel-xs',
  256: 'bg-[#C2410C] text-white border-honey-500 font-bold shadow-pixel',
  512: 'bg-[#EA580C] text-yellow-300 border-honey-400 font-bold shadow-pixel',
  1024: 'bg-[#DC2626] text-yellow-100 border-yellow-400 font-bold shadow-pixel ring-1 ring-yellow-400',
  2048: 'bg-[#78350F] text-amber-300 border-honey-500 font-bold shadow-pixel ring-2 ring-honey-500 animate-pulse',
};

const playSlideSound = (merged = false) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = merged ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(merged ? 659.25 : 300, ctx.currentTime);
    if (merged) {
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.12);
    } else {
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.06);
    }
    gain.gain.setValueAtTime(merged ? 0.09 : 0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + (merged ? 0.14 : 0.07));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (merged ? 0.15 : 0.08));
  } catch (e) {}
};

const getEmptyIndices = (board) => {
  const empty = [];
  board.forEach((val, idx) => {
    if (val === 0) empty.push(idx);
  });
  return empty;
};

const spawnTile = (board) => {
  const empty = getEmptyIndices(board);
  if (empty.length === 0) return board;
  const randIdx = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = [...board];
  newBoard[randIdx] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

const initBoard = () => {
  let b = Array(16).fill(0);
  b = spawnTile(b);
  b = spawnTile(b);
  return b;
};

// Check if any moves can be made
const checkCanMove = (board) => {
  if (board.includes(0)) return true;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c;
      const current = board[idx];
      // check right
      if (c < 3 && board[idx + 1] === current) return true;
      // check down
      if (r < 3 && board[idx + 4] === current) return true;
    }
  }
  return false;
};

export const Game2048 = ({ isPaused = false }) => {
  const [board, setBoard] = useState(initBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('studyhive_2048_best');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [acknowledgedWin, setAcknowledgedWin] = useState(false);

  // Slide & Merge Row logic
  const slideRowLeft = (row) => {
    const filtered = row.filter((x) => x !== 0);
    const newRow = [];
    let addedScore = 0;
    let i = 0;

    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const mergedVal = filtered[i] * 2;
        newRow.push(mergedVal);
        addedScore += mergedVal;
        i += 2;
      } else {
        newRow.push(filtered[i]);
        i += 1;
      }
    }
    while (newRow.length < 4) {
      newRow.push(0);
    }
    return { row: newRow, score: addedScore };
  };

  const move = useCallback(
    (direction) => {
      if (isPaused || gameOver) return;

      let newBoard = [...board];
      let totalAddedScore = 0;
      let moved = false;

      if (direction === 'LEFT') {
        for (let r = 0; r < 4; r++) {
          const row = [
            newBoard[r * 4],
            newBoard[r * 4 + 1],
            newBoard[r * 4 + 2],
            newBoard[r * 4 + 3],
          ];
          const res = slideRowLeft(row);
          totalAddedScore += res.score;
          for (let c = 0; c < 4; c++) {
            if (newBoard[r * 4 + c] !== res.row[c]) moved = true;
            newBoard[r * 4 + c] = res.row[c];
          }
        }
      } else if (direction === 'RIGHT') {
        for (let r = 0; r < 4; r++) {
          const row = [
            newBoard[r * 4 + 3],
            newBoard[r * 4 + 2],
            newBoard[r * 4 + 1],
            newBoard[r * 4],
          ];
          const res = slideRowLeft(row);
          totalAddedScore += res.score;
          const reversed = res.row.reverse();
          for (let c = 0; c < 4; c++) {
            if (newBoard[r * 4 + c] !== reversed[c]) moved = true;
            newBoard[r * 4 + c] = reversed[c];
          }
        }
      } else if (direction === 'UP') {
        for (let c = 0; c < 4; c++) {
          const col = [
            newBoard[c],
            newBoard[c + 4],
            newBoard[c + 8],
            newBoard[c + 12],
          ];
          const res = slideRowLeft(col);
          totalAddedScore += res.score;
          for (let r = 0; r < 4; r++) {
            if (newBoard[r * 4 + c] !== res.row[r]) moved = true;
            newBoard[r * 4 + c] = res.row[r];
          }
        }
      } else if (direction === 'DOWN') {
        for (let c = 0; c < 4; c++) {
          const col = [
            newBoard[c + 12],
            newBoard[c + 8],
            newBoard[c + 4],
            newBoard[c],
          ];
          const res = slideRowLeft(col);
          totalAddedScore += res.score;
          const reversed = res.row.reverse();
          for (let r = 0; r < 4; r++) {
            if (newBoard[r * 4 + c] !== reversed[r]) moved = true;
            newBoard[r * 4 + c] = reversed[r];
          }
        }
      }

      if (moved) {
        playSlideSound(totalAddedScore > 0);
        const spawnedBoard = spawnTile(newBoard);
        setBoard(spawnedBoard);

        const newScore = score + totalAddedScore;
        setScore(newScore);

        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem('studyhive_2048_best', newScore.toString());
        }

        // Check 2048 reach
        if (!acknowledgedWin && spawnedBoard.includes(2048)) {
          setHasWon(true);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#FBBF24', '#FDE68A', '#DC2626'],
          });
        }

        // Check if game over
        if (!checkCanMove(spawnedBoard)) {
          setGameOver(true);
        }
      }
    },
    [board, score, bestScore, isPaused, gameOver, acknowledgedWin]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPaused) return;

      const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];
      if (keys.includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          move('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          move('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          move('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          move('RIGHT');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, isPaused]);

  const restartGame = () => {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setHasWon(false);
    setAcknowledgedWin(false);
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="pixel-panel bg-cream-50 p-3 shadow-pixel-sm flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-honey-200 border-2 border-pixel-border px-3 py-1 text-xs font-pixel text-honey-900 shadow-pixel-xs">
            SCORE: {score}
          </div>
          <div className="flex items-center gap-1 font-sans text-xs text-oak-700 bg-cream-200 border border-pixel-border px-2 py-1">
            <Trophy size={13} className="text-amber-600" />
            <span className="font-mono font-bold">BEST: {bestScore}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={restartGame}
          className="pixel-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-oak-800"
          title="Restart new 2048 game"
        >
          <RotateCcw size={12} />
          <span>NEW GAME</span>
        </button>
      </div>

      {/* Main 2048 4x4 Board */}
      <div className="relative max-w-sm sm:max-w-md mx-auto p-3 bg-[#522504] border-4 border-pixel-border shadow-pixel-lg">
        {/* Board Tiles Grid */}
        <div className="grid grid-cols-4 gap-2.5 bg-[#3B1902] p-2.5 border-2 border-[#78350F]">
          {board.map((val, idx) => {
            const tileStyle = TILE_STYLES[val] || (val > 2048 ? TILE_STYLES[2048] : 'bg-[#451A03]/50 border-none');
            return (
              <div
                key={idx}
                className={`aspect-square rounded-xs border-2 flex items-center justify-center transition-all duration-150 select-none ${tileStyle}`}
              >
                {val > 0 && (
                  <span
                    className={`font-pixel tracking-tighter ${
                      val >= 1024
                        ? 'text-sm sm:text-base'
                        : val >= 128
                        ? 'text-base sm:text-lg'
                        : 'text-lg sm:text-xl'
                    }`}
                  >
                    {val}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-oak-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20 animate-fade-in">
            <div className="text-3xl mb-1">🐝💨</div>
            <h3 className="font-pixel text-sm text-yellow-300 mb-1">NO MORE MOVES!</h3>
            <p className="font-sans text-xs text-cream-200 mb-3">
              Final Score: <span className="font-bold text-amber-300">{score}</span>
            </p>
            <button
              type="button"
              onClick={restartGame}
              className="pixel-btn-primary text-xs px-4 py-2"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* 2048 Victory Modal */}
        {hasWon && !acknowledgedWin && (
          <div className="absolute inset-0 bg-oak-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20 animate-fade-in">
            <div className="text-4xl mb-1">👑🐝</div>
            <h3 className="font-pixel text-base text-yellow-400 mb-1">YOU REACHED 2048!</h3>
            <p className="font-sans text-xs text-cream-100 mb-3">
              Queen Bee status achieved! You can keep playing to reach an even higher score.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAcknowledgedWin(true)}
                className="pixel-btn-primary text-xs px-4 py-2"
              >
                KEEP GOING ⭐
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Retro D-Pad Controls (Touch & Click Support) */}
      <div className="flex flex-col items-center justify-center pt-1 select-none">
        <div className="font-pixel text-[8px] text-oak-600 mb-1.5 uppercase">
          SWIPE, USE ARROW KEYS, OR CLICK D-PAD:
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => move('UP')}
            className="pixel-btn bg-cream-100 hover:bg-honey-200 p-2 shadow-pixel-xs"
            title="Slide Up"
          >
            <ArrowUp size={16} />
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => move('LEFT')}
              className="pixel-btn bg-cream-100 hover:bg-honey-200 p-2 shadow-pixel-xs"
              title="Slide Left"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => move('DOWN')}
              className="pixel-btn bg-cream-100 hover:bg-honey-200 p-2 shadow-pixel-xs"
              title="Slide Down"
            >
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              onClick={() => move('RIGHT')}
              className="pixel-btn bg-cream-100 hover:bg-honey-200 p-2 shadow-pixel-xs"
              title="Slide Right"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
