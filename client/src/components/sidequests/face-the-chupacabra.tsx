import React, { useState } from 'react';
import { Link } from 'wouter';

type Choice = 'rock' | 'paper' | 'scissors';
type GamePhase = 'start' | 'playing' | 'won' | 'lost';

interface GameState {
  phase: GamePhase;
  playerKeys: number;
  playerLosses: number;
  lastResult: 'win' | 'lose' | 'tie' | null;
  playerChoice: Choice | null;
  chupacabraChoice: Choice | null;
  showResult: boolean;
}

const CHOICES: { value: Choice; image: string; label: string }[] = [
  { value: 'rock', image: '/sidequests/face-the-chupacabra/chupa-rock.png', label: 'Rock' },
  { value: 'paper', image: '/sidequests/face-the-chupacabra/chupa-paper.png', label: 'Paper' },
  { value: 'scissors', image: '/sidequests/face-the-chupacabra/chupa-scissors.png', label: 'Scissors' },
];

export function FaceTheChupacabra() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'start',
    playerKeys: 0,
    playerLosses: 0,
    lastResult: null,
    playerChoice: null,
    chupacabraChoice: null,
    showResult: false,
  });

  const startGame = () => {
    setGameState({
      phase: 'playing',
      playerKeys: 0,
      playerLosses: 0,
      lastResult: null,
      playerChoice: null,
      chupacabraChoice: null,
      showResult: false,
    });
  };

  const resetGame = () => {
    setGameState({
      phase: 'start',
      playerKeys: 0,
      playerLosses: 0,
      lastResult: null,
      playerChoice: null,
      chupacabraChoice: null,
      showResult: false,
    });
  };

  const determineWinner = (player: Choice, chupacabra: Choice): 'win' | 'lose' | 'tie' => {
    if (player === chupacabra) return 'tie';
    
    const winConditions = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper',
    };
    
    return winConditions[player] === chupacabra ? 'win' : 'lose';
  };

  const playRound = (playerChoice: Choice) => {
    const chupacabraChoice = CHOICES[Math.floor(Math.random() * 3)].value;
    const result = determineWinner(playerChoice, chupacabraChoice);
    
    const newKeys = result === 'win' ? gameState.playerKeys + 1 : gameState.playerKeys;
    const newLosses = result === 'lose' ? gameState.playerLosses + 1 : gameState.playerLosses;
    
    setGameState(prev => ({
      ...prev,
      playerChoice,
      chupacabraChoice,
      lastResult: result,
      showResult: true,
      playerKeys: newKeys,
      playerLosses: newLosses,
    }));

    // Check win/lose conditions after a delay
    setTimeout(() => {
      if (newKeys >= 3) {
        // Automatically return to main game after 3rd key
        setTimeout(() => {
          window.location.href = '/game/headquarters';
        }, 2000);
        setGameState(prev => ({ ...prev, phase: 'won' }));
      } else if (newLosses >= 3) {
        setGameState(prev => ({ ...prev, phase: 'lost' }));
      } else {
        setGameState(prev => ({ ...prev, showResult: false }));
      }
    }, 2000);
  };

  const getBackgroundImage = () => {
    switch (gameState.phase) {
      case 'start':
        return '/sidequests/face-the-chupacabra/chupa-behind-bars.png';
      case 'playing':
        return '/sidequests/face-the-chupacabra/chupa-bg.png';
      case 'won':
        return '/sidequests/face-the-chupacabra/chupa-bg.png';
      case 'lost':
        return '/sidequests/face-the-chupacabra/chupa-bg-bars.png';
      default:
        return '/sidequests/face-the-chupacabra/chupa-bg.png';
    }
  };

  const renderKeys = () => {
    return (
      <div className="flex gap-2 mb-4 justify-center">
        {[1, 2, 3].map((keyNum) => (
          <img
            key={keyNum}
            src={keyNum <= gameState.playerKeys 
              ? `/sidequests/face-the-chupacabra/chupa-key-${keyNum}.png`
              : `/sidequests/face-the-chupacabra/chupa-key.png`
            }
            alt={`Key ${keyNum}`}
            className={`w-16 h-16 ${keyNum <= gameState.playerKeys ? 'opacity-100' : 'opacity-30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 text-white relative"
      style={{ backgroundImage: `url(${getBackgroundImage()})` }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative z-10 text-center max-w-lg w-full">
        {gameState.phase === 'start' && (
          <div className="flex flex-col items-center justify-between min-h-screen pt-8 pb-20">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-red-500 mb-4 drop-shadow-lg" style={{ fontFamily: 'Creepster, cursive' }}>
                Face the Chupacabra
              </h1>
              <p className="text-xl text-gray-200">
                Win 3 rounds of rock-paper-scissors to escape!
              </p>
            </div>
            <button
              onClick={startGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState.phase === 'playing' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Choose Your Weapon!</h2>
            
            {renderKeys()}
            
            {!gameState.showResult && (
              <div className="grid grid-cols-3 gap-4">
                {CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    onClick={() => playRound(choice.value)}
                    className="group relative bg-gray-800/80 hover:bg-gray-700/80 p-4 rounded-lg transition-all hover:scale-105 border-2 border-gray-600 hover:border-red-500"
                    title={choice.value === 'scissors' ? 'Staby Staby' : choice.label}
                  >
                    <img
                      src={choice.image}
                      alt={choice.label}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <div className="text-sm font-medium">{choice.label}</div>
                    
                    {choice.value === 'scissors' && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-red-400 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Staby Staby
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {gameState.showResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">You</h3>
                    <img
                      src={CHOICES.find(c => c.value === gameState.playerChoice)?.image}
                      alt="Your choice"
                      className="w-20 h-20 mx-auto"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">Chupacabra</h3>
                    <img
                      src={CHOICES.find(c => c.value === gameState.chupacabraChoice)?.image}
                      alt="Chupacabra's choice"
                      className="w-20 h-20 mx-auto"
                    />
                  </div>
                </div>
                
                <div className="text-2xl font-bold">
                  {gameState.lastResult === 'win' && (
                    <div className="text-green-400">
                      <div>You Won!</div>
                      <div className="flex justify-center mt-2">
                        <img
                          src={`/sidequests/face-the-chupacabra/chupa-key-${gameState.playerKeys}.png`}
                          alt={`Key ${gameState.playerKeys}`}
                          className="w-24 h-24 animate-bounce"
                        />
                      </div>
                    </div>
                  )}
                  {gameState.lastResult === 'lose' && (
                    <div className="text-red-400">
                      <div>Chupacabra Wins!</div>
                      <img
                        src="/sidequests/face-the-chupacabra/chupa-bite.png"
                        alt="Chupacabra bite"
                        className="w-24 h-24 mx-auto mt-2 animate-bounce"
                      />
                    </div>
                  )}
                  {gameState.lastResult === 'tie' && (
                    <div className="text-yellow-400">It's a Tie!</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-300">
              Keys: {gameState.playerKeys}/3 | Losses: {gameState.playerLosses}/3
            </div>
          </div>
        )}

        {gameState.phase === 'won' && (
          <div className="space-y-6 animate-pulse">
            <h2 className="text-4xl font-bold text-green-400 mb-4">🎉 ESCAPED! 🎉</h2>
            <div className="flex justify-center mb-6">
              <img
                src="/sidequests/face-the-chupacabra/chupa-key-3.png"
                alt="Final Key"
                className="w-24 h-24 animate-bounce"
              />
            </div>
            <p className="text-xl text-gray-200 mb-6">
              You collected all 3 keys and escaped! Returning to Main Game...
            </p>
            {renderKeys()}
          </div>
        )}

        {gameState.phase === 'lost' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-red-500 mb-4">💀 GAME OVER 💀</h2>
            <div className="relative">
              <img
                src="/sidequests/face-the-chupacabra/chupa-bite.png"
                alt="Chupacabra victory"
                className="w-32 h-32 mx-auto animate-bounce"
              />
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <div className="text-6xl">🔒</div>
              </div>
            </div>
            <p className="text-xl text-gray-200 mb-6">
              The Chupacabra has defeated you! You remain trapped...
            </p>
            <div className="space-y-4">
              <button
                onClick={resetGame}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
              <Link
                href="/game/headquarters"
                className="block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                Return to Main Game
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}