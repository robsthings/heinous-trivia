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
        <div >
          <div  style={{textAlign: "center"}}>
            <h2 >
              SYSTEM FAILURE!
            </h2>
            <p  >
              The wiring overloaded and sparked out!
            </p>
            <p >
              Final Score: {gameState.score}
            </p>
            <div >
              <button
                onClick={resetGame}
                
              >
                Try Again
              </button>
              <Link
                href="/game"
                
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {gameState.isComplete && (
        <div >
          <div  style={{textAlign: "center"}}>
            <h2 >
              CIRCUIT COMPLETE!
            </h2>
            <p  >
              You've successfully rewired the system!
            </p>
            <p >
              Score: {gameState.score} points
            </p>
            <div >
              <button
                onClick={resetGame}
                
              >
                Play Again
              </button>
              <Link
                href="/game"
                
              >
                Return to Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Game UI */}
      <div >
        {/* Header */}
        <div  style={{justifyContent: "space-between"}}>
          <div >
            Score: {gameState.score}
          </div>
          <div  style={{ fontFamily: 'Courier, monospace' }}>
            WRETCHED WIRING
          </div>
          <div >
            Time: {gameState.timeRemaining}s
          </div>
        </div>

        {/* Game Start Screen */}
        {!gameState.isPlaying && !gameState.isGameOver && !gameState.isComplete && (
          <div >
            <div  style={{textAlign: "center"}}>
              <h1   style={{ fontFamily: 'Courier, monospace' }}>
                WRETCHED WIRING
              </h1>
              <p >
                Connect the colored wires to their correct terminals before the system overloads! 
                Match the circuit patterns to complete each puzzle.
              </p>
              <button
                onClick={startGame}
                
              >
                Start Wiring
              </button>
            </div>
          </div>
        )}

        {/* Game Board */}
        {gameState.isPlaying && (
          <div >
            <div >
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
              <div >
                <div  style={{textAlign: "center"}}>
                  🔌 Interactive Wiring Puzzle Interface 🔌
                  <br />
                  <span >
                    Wire connection logic will be implemented here
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div  style={{textAlign: "center"}}>
                <p >
                  <span >Red wire</span> → Terminal A1 to B3
                </p>
                <p >
                  <span >Blue wire</span> → Terminal A2 to B1
                </p>
                <p >
                  <span >Green wire</span> → Terminal A3 to B4
                </p>
                <p >
                  <span >Yellow wire</span> → Terminal A4 to B2
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        {!gameState.isPlaying && !gameState.isGameOver && !gameState.isComplete && (
          <div >
            <Link
              href="/game"
              
            >
              ← Back to Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}