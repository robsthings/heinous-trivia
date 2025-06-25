import { useState, useEffect } from 'react';
import { Link } from 'wouter';

interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  isComplete: boolean;
  currentPuzzle: number;
  score: number;
  timeRemaining: number;
  connections: Connection[];
  availableWires: Wire[];
  targetConnections: Connection[];
}

interface Wire {
  id: string;
  color: string;
  startPoint: { x: number; y: number };
  endPoint?: { x: number; y: number };
  isConnected: boolean;
}

interface Connection {
  id: string;
  wireId: string;
  startTerminal: string;
  endTerminal: string;
  isCorrect: boolean;
}

const INITIAL_GAME_STATE: GameState = {
  isPlaying: false,
  isGameOver: false,
  isComplete: false,
  currentPuzzle: 1,
  score: 0,
  timeRemaining: 60,
  connections: [],
  availableWires: [],
  targetConnections: []
};

export function WretchedWiring() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  // Initialize puzzle wires and connections
  const initializePuzzle = (puzzleNumber: number) => {
    // Generate puzzle-specific wire layout
    const wires: Wire[] = [
      { id: 'red', color: '#ef4444', startPoint: { x: 50, y: 100 }, isConnected: false },
      { id: 'blue', color: '#3b82f6', startPoint: { x: 50, y: 150 }, isConnected: false },
      { id: 'green', color: '#10b981', startPoint: { x: 50, y: 200 }, isConnected: false },
      { id: 'yellow', color: '#f59e0b', startPoint: { x: 50, y: 250 }, isConnected: false }
    ];

    // Define target connections for this puzzle
    const targets: Connection[] = [
      { id: 'target1', wireId: 'red', startTerminal: 'A1', endTerminal: 'B3', isCorrect: true },
      { id: 'target2', wireId: 'blue', startTerminal: 'A2', endTerminal: 'B1', isCorrect: true },
      { id: 'target3', wireId: 'green', startTerminal: 'A3', endTerminal: 'B4', isCorrect: true },
      { id: 'target4', wireId: 'yellow', startTerminal: 'A4', endTerminal: 'B2', isCorrect: true }
    ];

    setGameState(prev => ({
      ...prev,
      availableWires: wires,
      targetConnections: targets,
      connections: [],
      timeRemaining: 60 - (puzzleNumber - 1) * 10 // Progressively less time
    }));
  };

  // Start game
  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    initializePuzzle(1);
  };

  // Reset game
  const resetGame = () => {
    setGameState(INITIAL_GAME_STATE);
  };

  // Handle wire connection
  const handleWireConnection = (wireId: string, terminal: string) => {
    // Puzzle logic will be implemented here
    console.log(`Connecting wire ${wireId} to terminal ${terminal}`);
  };

  // Check if puzzle is solved
  const checkPuzzleCompletion = () => {
    const correctConnections = gameState.connections.filter(conn => 
      gameState.targetConnections.some(target => 
        target.wireId === conn.wireId && 
        target.startTerminal === conn.startTerminal && 
        target.endTerminal === conn.endTerminal
      )
    );

    if (correctConnections.length === gameState.targetConnections.length) {
      // Puzzle completed
      setGameState(prev => ({
        ...prev,
        isComplete: true,
        score: prev.score + prev.timeRemaining * 10
      }));
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isComplete && gameState.timeRemaining > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeRemaining === 0) {
      setGameState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));
    }
  }, [gameState.isPlaying, gameState.isComplete, gameState.timeRemaining]);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      backgroundColor: '#111827'
    }}>
      {/* Background */}
      <div 
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundImage: 'url(/sidequests/wretched-wiring/wiring-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.8
        }}
      />

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative z-10  bg-gray-800 p-8 rounded-xl border-2 border-red-500" style={{textAlign: "center"}}>
            <h2 className="text-4xl font-bold text-red-400 mb-4 drop-shadow-lg">
              SYSTEM FAILURE!
            </h2>
            <p className="text-xl text-white  drop-shadow-lg" className="mb-6">
              The wiring overloaded and sparked out!
            </p>
            <p className="text-lg text-white mb-8 drop-shadow-lg">
              Final Score: {gameState.score}
            </p>
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Try Again
              </button>
              <Link
                href="/game"
                className="block px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {gameState.isComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative z-10  bg-gray-800 p-8 rounded-xl border-2 border-green-500" style={{textAlign: "center"}}>
            <h2 className="text-4xl font-bold text-green-400 mb-4 drop-shadow-lg">
              CIRCUIT COMPLETE!
            </h2>
            <p className="text-xl text-white  drop-shadow-lg" className="mb-6">
              You've successfully rewired the system!
            </p>
            <p className="text-lg text-white mb-8 drop-shadow-lg">
              Score: {gameState.score} points
            </p>
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Play Again
              </button>
              <Link
                href="/game"
                className="block px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game UI */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <div className="flex  items-center p-6" style={{justifyContent: "space-between"}}>
          <div className="text-2xl font-bold text-white drop-shadow-lg">
            Score: {gameState.score}
          </div>
          <div className="text-lg text-white drop-shadow-lg" style={{ fontFamily: 'Courier, monospace' }}>
            WRETCHED WIRING
          </div>
          <div className="text-xl font-bold text-white drop-shadow-lg">
            Time: {gameState.timeRemaining}s
          </div>
        </div>

        {/* Game Start Screen */}
        {!gameState.isPlaying && !gameState.isGameOver && !gameState.isComplete && (
          <div className="flex-1 flex items-center justify-center">
            <div className=" bg-gray-800 bg-opacity-90 p-8 rounded-xl border-2 border-blue-500" style={{textAlign: "center"}}>
              <h1 className="text-4xl font-bold text-blue-400  drop-shadow-lg" className="mb-6" style={{ fontFamily: 'Courier, monospace' }}>
                WRETCHED WIRING
              </h1>
              <p className="text-lg text-white mb-8 drop-shadow-lg max-w-md">
                Connect the colored wires to their correct terminals before the system overloads! 
                Match the circuit patterns to complete each puzzle.
              </p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg text-xl"
              >
                Start Wiring
              </button>
            </div>
          </div>
        )}

        {/* Game Board */}
        {gameState.isPlaying && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-gray-800 bg-opacity-95 p-8 rounded-xl border-2 border-yellow-500 w-full max-w-4xl">
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#facc15',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Puzzle {gameState.currentPuzzle}: Connect the Circuit
              </h2>
              
              {/* Wiring Board Placeholder */}
              <div className="relative bg-gray-900 border-2 border-gray-600 rounded-lg p-8 h-96">
                <div className=" text-white text-xl mt-32" style={{textAlign: "center"}}>
                  🔌 Interactive Wiring Puzzle Interface 🔌
                  <br />
                  <span className="text-sm text-gray-400 mt-4 block">
                    Wire connection logic will be implemented here
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 " style={{textAlign: "center"}}>
                <p className="text-white mb-2">
                  <span className="text-red-400">Red wire</span> → Terminal A1 to B3
                </p>
                <p className="text-white mb-2">
                  <span className="text-blue-400">Blue wire</span> → Terminal A2 to B1
                </p>
                <p className="text-white mb-2">
                  <span className="text-green-400">Green wire</span> → Terminal A3 to B4
                </p>
                <p className="text-white">
                  <span className="text-yellow-400">Yellow wire</span> → Terminal A4 to B2
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        {!gameState.isPlaying && !gameState.isGameOver && !gameState.isComplete && (
          <div className="absolute bottom-6 left-6">
            <Link
              href="/game"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
            >
              ← Back to Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}