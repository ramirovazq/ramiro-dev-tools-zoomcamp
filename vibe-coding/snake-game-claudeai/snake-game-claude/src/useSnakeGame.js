import { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{x: 10, y: 10}];
const INITIAL_DIRECTION = {x: 1, y: 0};
const GAME_SPEED = 150;

export const useSnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({x: 15, y: 15});
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameMode, setGameMode] = useState('wall');

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  }, [generateFood]);

  const toggleGameMode = useCallback(() => {
    setGameMode(mode => mode === 'wall' ? 'pass-through' : 'wall');
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  }, [generateFood]);

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

  const handleKeyPress = useCallback((e) => {
    if (gameOver) return;

    switch(e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        setDirection(prev => prev.y === 0 ? {x: 0, y: -1} : prev);
        break;
      case 's':
      case 'arrowdown':
        setDirection(prev => prev.y === 0 ? {x: 0, y: 1} : prev);
        break;
      case 'a':
      case 'arrowleft':
        setDirection(prev => prev.x === 0 ? {x: -1, y: 0} : prev);
        break;
      case 'd':
      case 'arrowright':
        setDirection(prev => prev.x === 0 ? {x: 1, y: 0} : prev);
        break;
      case ' ':
        setIsPaused(p => !p);
        break;
      default:
        break;
    }
  }, [gameOver]);

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return {
    snake,
    food,
    direction,
    gameOver,
    score,
    isPaused,
    gameMode,
    resetGame,
    toggleGameMode,
    setIsPaused,
    GRID_SIZE,
    CELL_SIZE
  };
};
