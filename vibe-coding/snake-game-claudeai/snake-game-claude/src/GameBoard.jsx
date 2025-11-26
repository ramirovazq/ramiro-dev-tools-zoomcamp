import React from 'react';

export function GameBoard({ snake, food, gameOver, isPaused, score, gameMode, resetGame, toggleGameMode, GRID_SIZE, CELL_SIZE }) {
  return (
    <>
      {/* Header */}
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

      {/* Game Board */}
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

      {/* Controls */}
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
    </>
  );
}
