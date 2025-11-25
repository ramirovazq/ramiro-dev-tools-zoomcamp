import React, { useRef, useEffect, useState } from "react";

// SnakeGame.jsx
// Single-file React component (default export). Uses Tailwind for styling.
// Controls: Arrow keys or WASD. Buttons for Pause / Restart. Responsive canvas.

const CELL_SIZE = 20; // pixels per cell
const DEFAULT_COLS = 30;
const DEFAULT_ROWS = 30;
const INITIAL_SNAKE = [ { x: 8, y: 15 }, { x: 7, y: 15 }, { x: 6, y: 15 } ];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_SPEED = 8; // frames per second

function randomFoodPosition(cols, rows, snake) {
  while (true) {
    const pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    const collision = snake.some(s => s.x === pos.x && s.y === pos.y);
    if (!collision) return pos;
  }
}

export default function SnakeGame({ cols = DEFAULT_COLS, rows = DEFAULT_ROWS }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const lastFrameTimeRef = useRef(0);

  const [cellSize, setCellSize] = useState(CELL_SIZE);
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(() => randomFoodPosition(cols, rows, INITIAL_SNAKE));
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Resize canvas based on available width while keeping cells square
  useEffect(() => {
    function updateSize() {
      const container = canvasRef.current?.parentElement;
      if (!container) return;
      const maxWidth = Math.min(container.clientWidth - 24, cols * CELL_SIZE);
      const newCell = Math.max(8, Math.floor(maxWidth / cols));
      setCellSize(newCell);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = newCell * cols;
        canvas.height = newCell * rows;
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [cols, rows]);

  // Key handlers for direction control
  useEffect(() => {
    function onKey(e) {
      const key = e.key;
      let dir = null;
      if (key === 'ArrowUp' || key === 'w' || key === 'W') dir = { x: 0, y: -1 };
      if (key === 'ArrowDown' || key === 's' || key === 'S') dir = { x: 0, y: 1 };
      if (key === 'ArrowLeft' || key === 'a' || key === 'A') dir = { x: -1, y: 0 };
      if (key === 'ArrowRight' || key === 'd' || key === 'D') dir = { x: 1, y: 0 };
      if (!dir) return;
      // prevent reversing direction directly
      if (dir.x === -direction.x && dir.y === -direction.y) return;
      setNextDirection(dir);
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [direction]);

  // Main game loop using requestAnimationFrame and speed (fps)
  useEffect(() => {
    function step(timestamp) {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const secondsSinceLastFrame = (timestamp - lastFrameTimeRef.current) / 1000;
      const frameDuration = 1 / speed;
      if (running && secondsSinceLastFrame >= frameDuration) {
        lastFrameTimeRef.current = timestamp;
        setDirection(prev => {
          // lock in the nextDirection at tick time
          const nd = nextDirection;
          return nd;
        });

        setSnake(prevSnake => {
          const newHead = { x: (prevSnake[0].x + nextDirection.x + cols) % cols, y: (prevSnake[0].y + nextDirection.y + rows) % rows };
          // check collision with body
          const collided = prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y);
          if (collided) {
            setRunning(false);
            setGameOver(true);
            return prevSnake;
          }

          let grew = false;
          if (newHead.x === food.x && newHead.y === food.y) {
            grew = true;
            setScore(s => s + 1);
            setFood(randomFoodPosition(cols, rows, [newHead, ...prevSnake]));
          }

          const newSnake = [newHead, ...prevSnake];
          if (!grew) newSnake.pop();
          return newSnake;
        });
      }
      requestRef.current = requestAnimationFrame(step);
    }

    requestRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(requestRef.current);
  }, [running, speed, nextDirection, cols, rows, food]);

  // Draw the board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // clear
    ctx.fillStyle = '#0f172a'; // Tailwind slate-900 (dark background)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw grid (subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      const x = c * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      const y = r * cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // draw food
    ctx.fillStyle = '#dc2626'; // red-600
    ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);

    // draw snake
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#86efac' : '#4ade80'; // head brighter
      ctx.fillRect(seg.x * cellSize + 1, seg.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });
  }, [snake, food, cellSize, cols, rows]);

  function restart() {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    setFood(randomFoodPosition(cols, rows, INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }

  function toggleRunning() {
    if (gameOver) return;
    setRunning(r => !r);
  }

  function changeSpeed(delta) {
    setSpeed(s => Math.max(2, Math.min(20, s + delta)));
  }

  // Touch controls for mobile: simple swipe detection
  useEffect(() => {
    let touchStart = null;
    function onTouchStart(e) {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
    }
    function onTouchEnd(e) {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 20) setNextDirection({ x: 1, y: 0 });
        else if (dx < -20) setNextDirection({ x: -1, y: 0 });
      } else {
        if (dy > 20) setNextDirection({ x: 0, y: 1 });
        else if (dy < -20) setNextDirection({ x: 0, y: -1 });
      }
      touchStart = null;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="bg-slate-800 rounded-2xl shadow-lg p-4 flex-shrink-0">
          <div className="mb-2 text-slate-200 text-lg font-semibold">Snake</div>
          <div className="flex gap-2 items-center mb-3">
            <div className="text-slate-300">Score:</div>
            <div className="text-white font-mono text-xl">{score}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleRunning} className="px-3 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-500 disabled:opacity-50">
              {running ? 'Pausar' : 'Continuar'}
            </button>
            <button onClick={restart} className="px-3 py-2 bg-emerald-600 rounded-md text-white hover:bg-emerald-500">Reiniciar</button>
          </div>

          <div className="mt-4">
            <div className="text-slate-300 mb-2">Velocidad</div>
            <div className="flex gap-2">
              <button onClick={() => changeSpeed(-1)} className="px-2 py-1 bg-slate-700 rounded">-</button>
              <div className="px-3 py-1 bg-slate-900 rounded text-white font-mono">{speed}</div>
              <button onClick={() => changeSpeed(1)} className="px-2 py-1 bg-slate-700 rounded">+</button>
            </div>
          </div>

          <div className="mt-4 text-slate-400 text-sm">
            Usa las flechas o WASD para mover. En móvil, desliza para mover.
          </div>

          {gameOver && (
            <div className="mt-4 p-3 bg-red-600 text-white rounded">Juego terminado — pulsa Reiniciar</div>
          )}
        </div>

        <div className="flex-1 bg-slate-900 rounded-2xl p-4 flex flex-col items-center">
          <div className="mb-3 text-slate-200">Tablero</div>
          <div className="rounded overflow-hidden touch-none">
            <canvas ref={canvasRef} className="block" style={{ width: cellSize * cols, height: cellSize * rows }} />
          </div>
          <div className="mt-3 text-slate-400 text-sm">Tamaño: {cols} x {rows} — Celda: {cellSize}px</div>
        </div>
      </div>

      <div className="mt-6 text-slate-500 text-sm">Hecho con React + Tailwind. Exporta este archivo y úsalo dentro de tu app (por ejemplo en Vite/CRA).</div>
    </div>
  );
}
