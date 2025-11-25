import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{x: 10, y: 10}];
const INITIAL_DIRECTION = {x: 1, y: 0};
const GAME_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({x: 15, y: 15});
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState('wall'); // 'wall' or 'pass-through'

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const toggleGameMode = () => {
    setGameMode(mode => mode === 'wall' ? 'pass-through' : 'wall');
    resetGame();
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      let newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      // Handle wall collision based on game mode
      if (gameMode === 'wall') {
        // Wall mode: collision ends game
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || 
            newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }
      } else {
        // Pass-through mode: wrap around edges
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setFood(generateFood());
        setScore(s => s + 10);
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, generateFood, gameMode]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;

      switch(e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          if (direction.y === 0) setDirection({x: 0, y: -1});
          break;
        case 's':
        case 'arrowdown':
          if (direction.y === 0) setDirection({x: 0, y: 1});
          break;
        case 'a':
        case 'arrowleft':
          if (direction.x === 0) setDirection({x: -1, y: 0});
          break;
        case 'd':
        case 'arrowright':
          if (direction.x === 0) setDirection({x: 1, y: 0});
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-green-400 mb-2">Snake Game</h1>
        <div className="flex items-center justify-center gap-4 mb-2">
          <p className="text-xl text-white">Score: {score}</p>
          <div className="flex items-center gap-2">
            <span className="text-white">Mode:</span>
            <button
              onClick={toggleGameMode}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm"
            >
              {gameMode === 'wall' ? '🧱 Wall' : '🔄 Pass-Through'}
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-400">
          {gameMode === 'wall' 
            ? 'Hit the wall and you lose!' 
            : 'Snake wraps around the edges'}
        </p>
      </div>

      <div 
        className="relative border-4 border-green-500"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          backgroundColor: '#1a1a1a'
        }}
      >
        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className={i === 0 ? 'bg-green-400' : 'bg-green-600'}
            style={{
              position: 'absolute',
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              borderRadius: '2px'
            }}
          />
        ))}

        {/* Food */}
        <div
          className="bg-red-500 rounded-full"
          style={{
            position: 'absolute',
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2
          }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over!</h2>
              <p className="text-xl text-white mb-4">Final Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
            <h2 className="text-3xl font-bold text-yellow-400">Paused</h2>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-gray-300">
        <p className="mb-2">Use WASD or Arrow Keys to move</p>
        <p className="mb-2">Press Space to pause</p>
        <button
          onClick={resetGame}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}