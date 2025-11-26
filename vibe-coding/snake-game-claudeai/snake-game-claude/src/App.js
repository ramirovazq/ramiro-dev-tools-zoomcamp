import React from 'react';
import { useSnakeGame } from './useSnakeGame';
import { GameBoard } from './GameBoard';

export default function SnakeGame() {
  const gameState = useSnakeGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <GameBoard {...gameState} />
    </div>
  );
}