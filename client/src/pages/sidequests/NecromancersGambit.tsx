import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Card {
  id: number;
  name: string;
  power: number;
  description: string;
  effect: string;
  icon: string;
}

const playerCards: Card[] = [
  { id: 1, name: "Holy Water", power: 8, description: "Purifies the unholy", effect: "Burns undead for extra damage", icon: "💧" },
  { id: 2, name: "Silver Cross", power: 6, description: "Sacred protection", effect: "Blocks necromantic spells", icon: "✝️" },
  { id: 3, name: "Garlic Bulbs", power: 4, description: "Natural repellent", effect: "Weakens vampire minions", icon: "🧄" },
  { id: 4, name: "Iron Stake", power: 7, description: "Cold iron pierces darkness", effect: "Critical hit vs spirits", icon: "🗡️" },
  { id: 5, name: "Blessed Candle", power: 5, description: "Light banishes shadow", effect: "Reveals hidden traps", icon: "🕯️" },
  { id: 6, name: "Ancient Tome", power: 9, description: "Knowledge is power", effect: "Counters dark magic", icon: "📖" },
];

const necromancerCards: Card[] = [
  { id: 7, name: "Bone Shield", power: 6, description: "Armor of the dead", effect: "Absorbs incoming damage", icon: "🦴" },
  { id: 8, name: "Soul Drain", power: 8, description: "Steals life force", effect: "Heals necromancer", icon: "👻" },
  { id: 9, name: "Zombie Horde", power: 5, description: "Overwhelming numbers", effect: "Swarms opponent", icon: "🧟" },
  { id: 10, name: "Dark Ritual", power: 9, description: "Forbidden magic", effect: "Doubles next spell", icon: "⚫" },
  { id: 11, name: "Spectral Chains", power: 7, description: "Binds the living", effect: "Prevents escape", icon: "⛓️" },
  { id: 12, name: "Death's Touch", power: 10, description: "Ultimate darkness", effect: "Instant defeat", icon: "💀" },
];

type GamePhase = "intro" | "player-turn" | "necromancer-turn" | "battle" | "victory" | "defeat";

export function NecromancersGambit() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [necromancerHand, setNecromancerHand] = useState<Card[]>([]);
  const [playerSelectedCard, setPlayerSelectedCard] = useState<Card | null>(null);
  const [necromancerSelectedCard, setNecromancerSelectedCard] = useState<Card | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [necromancerScore, setNecromancerScore] = useState(0);
  const [round, setRound] = useState(1);
  const [battleResult, setBattleResult] = useState<string>("");
  const [gameHistory, setGameHistory] = useState<string[]>([]);

  const startGame = () => {
    // Shuffle and deal 3 cards to each player
    const shuffledPlayerCards = [...playerCards].sort(() => Math.random() - 0.5);
    const shuffledNecromancerCards = [...necromancerCards].sort(() => Math.random() - 0.5);
    
    setPlayerHand(shuffledPlayerCards.slice(0, 3));
    setNecromancerHand(shuffledNecromancerCards.slice(0, 3));
    setPlayerScore(0);
    setNecromancerScore(0);
    setRound(1);
    setGameHistory([]);
    setGamePhase("player-turn");
  };

  const selectPlayerCard = (card: Card) => {
    if (gamePhase !== "player-turn") return;
    setPlayerSelectedCard(card);
    
    // Remove card from hand
    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    
    // AI selects necromancer card
    setTimeout(() => {
      const randomCard = necromancerHand[Math.floor(Math.random() * necromancerHand.length)];
      setNecromancerSelectedCard(randomCard);
      setNecromancerHand(prev => prev.filter(c => c.id !== randomCard.id));
      setGamePhase("battle");
    }, 1000);
  };

  const resolveBattle = () => {
    if (!playerSelectedCard || !necromancerSelectedCard) return;

    let playerPower = playerSelectedCard.power;
    let necromancerPower = necromancerSelectedCard.power;
    let resultText = "";

    // Apply card effects
    const effects = [];

    // Player card effects
    if (playerSelectedCard.name === "Holy Water" && necromancerSelectedCard.name.includes("Soul")) {
      playerPower += 3;
      effects.push("Holy Water burns the undead!");
    }
    if (playerSelectedCard.name === "Silver Cross" && necromancerSelectedCard.name === "Dark Ritual") {
      necromancerPower = Math.floor(necromancerPower / 2);
      effects.push("Silver Cross disrupts dark magic!");
    }
    if (playerSelectedCard.name === "Iron Stake" && necromancerSelectedCard.name.includes("Spectral")) {
      playerPower += 4;
      effects.push("Iron pierces spectral defenses!");
    }

    // Necromancer card effects
    if (necromancerSelectedCard.name === "Death's Touch" && Math.random() < 0.3) {
      necromancerPower = 999;
      effects.push("Death's Touch activates! Instant defeat!");
    }
    if (necromancerSelectedCard.name === "Dark Ritual") {
      necromancerPower *= 2;
      effects.push("Dark Ritual doubles the necromancer's power!");
    }
    if (necromancerSelectedCard.name === "Bone Shield" && playerPower < 7) {
      necromancerPower += 2;
      effects.push("Bone Shield absorbs weak attacks!");
    }

    // Determine winner
    if (playerPower > necromancerPower) {
      setPlayerScore(prev => prev + 1);
      resultText = `Victory! ${playerSelectedCard.name} (${playerPower}) defeats ${necromancerSelectedCard.name} (${necromancerPower})`;
    } else if (necromancerPower > playerPower) {
      setNecromancerScore(prev => prev + 1);
      resultText = `Defeat! ${necromancerSelectedCard.name} (${necromancerPower}) overpowers ${playerSelectedCard.name} (${playerPower})`;
    } else {
      resultText = `Draw! Both cards have equal power (${playerPower})`;
    }

    if (effects.length > 0) {
      resultText += " " + effects.join(" ");
    }

    setBattleResult(resultText);
    setGameHistory(prev => [...prev, resultText]);

    // Check for game end
    setTimeout(() => {
      if (playerScore + 1 >= 2) {
        setGamePhase("victory");
      } else if (necromancerScore + 1 >= 2) {
        setGamePhase("defeat");
      } else if (playerHand.length === 0) {
        // Final scoring
        const finalPlayerScore = playerScore + (playerPower > necromancerPower ? 1 : 0);
        const finalNecromancerScore = necromancerScore + (necromancerPower > playerPower ? 1 : 0);
        
        if (finalPlayerScore > finalNecromancerScore) {
          setGamePhase("victory");
        } else {
          setGamePhase("defeat");
        }
      } else {
        setRound(prev => prev + 1);
        setPlayerSelectedCard(null);
        setNecromancerSelectedCard(null);
        setBattleResult("");
        setGamePhase("player-turn");
      }
    }, 3000);
  };

  useEffect(() => {
    if (gamePhase === "battle") {
      setTimeout(resolveBattle, 1500);
    }
  }, [gamePhase]);

  const getNecromancerReaction = () => {
    if (gamePhase === "victory") {
      return "Impossible! No mortal should possess such power!";
    } else if (gamePhase === "defeat") {
      return "Your soul belongs to me now, foolish mortal!";
    } else if (necromancerScore > playerScore) {
      return "Yes... feel the darkness consuming you...";
    } else if (playerScore > necromancerScore) {
      return "Beginner's luck, nothing more!";
    } else {
      return "We are evenly matched... for now.";
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #581c87, #374151, #000000)',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="max-w-6xl w-full">
        
        {/* Header */}
        <div  className="mb-6" style={{textAlign: "center"}}>
          <h1 className="text-4xl lg:text-6xl font-bold text-purple-400 mb-4 tracking-wider">
            NECROMANCER'S GAMBIT
          </h1>
          <p className="text-lg text-gray-300">
            A strategic battle of cards against the forces of darkness
          </p>
        </div>

        {gamePhase === "intro" && (
          <div className=" bg-black/50 backdrop-blur-sm p-8 rounded-lg border border-purple-500/30" style={{textAlign: "center"}}>
            <div className="mb-6">
              <span className="text-8xl">💀</span>
            </div>
            <h2 className="text-2xl font-bold text-purple-400 mb-4">The Challenge Awaits</h2>
            <p className="text-gray-300  max-w-md mx-auto" className="mb-6">
              Face the ancient necromancer in a battle of strategy and cunning. 
              Choose your cards wisely - each has unique powers that can turn the tide of battle.
              First to win 2 rounds claims victory!
            </p>
            <Button 
              onClick={startGame}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Begin the Gambit
            </Button>
          </div>
        )}

        {(gamePhase === "player-turn" || gamePhase === "battle") && (
          <div>
            {/* Score Display */}
            <div className="flex  items-center  bg-black/30 rounded-lg p-4" style={{justifyContent: "space-between"}} className="mb-6">
              <div style={{textAlign: "center"}}>
                <div className="text-2xl font-bold text-blue-400">{playerScore}</div>
                <div className="text-sm text-gray-400">Player Wins</div>
              </div>
              <div style={{textAlign: "center"}}>
                <div className="text-xl text-purple-400">Round {round}</div>
                <div className="text-sm text-gray-400">of 3</div>
              </div>
              <div style={{textAlign: "center"}}>
                <div className="text-2xl font-bold text-red-400">{necromancerScore}</div>
                <div className="text-sm text-gray-400">Necromancer Wins</div>
              </div>
            </div>

            {/* Battle Area */}
            {gamePhase === "battle" && playerSelectedCard && necromancerSelectedCard && (
              <div style={{
              backgroundColor: 'rgba(31, 41, 55, 0.5)',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              border: '1px solid #4b5563',
              marginBottom: '1.5rem'
            }}>
                <h3 className="text-xl font-bold  mb-4 text-purple-400" style={{textAlign: "center"}}>Battle in Progress</h3>
                <div className="flex  items-center" style={{justifyContent: "space-between"}}>
                  <div className=" bg-blue-900/30 rounded-lg p-4 border border-blue-500/30" style={{textAlign: "center"}}>
                    <div className="text-3xl mb-2">{playerSelectedCard.icon}</div>
                    <div className="font-bold text-blue-400">{playerSelectedCard.name}</div>
                    <div className="text-lg text-white">Power: {playerSelectedCard.power}</div>
                    <div className="text-xs text-gray-400 mt-1">{playerSelectedCard.effect}</div>
                  </div>
                  
                  <div className=" mx-4" style={{textAlign: "center"}}>
                    <div className="text-4xl animate-pulse">⚔️</div>
                    <div className="text-sm text-gray-400 mt-2">VS</div>
                  </div>
                  
                  <div className=" bg-red-900/30 rounded-lg p-4 border border-red-500/30" style={{textAlign: "center"}}>
                    <div className="text-3xl mb-2">{necromancerSelectedCard.icon}</div>
                    <div className="font-bold text-red-400">{necromancerSelectedCard.name}</div>
                    <div className="text-lg text-white">Power: {necromancerSelectedCard.power}</div>
                    <div className="text-xs text-gray-400 mt-1">{necromancerSelectedCard.effect}</div>
                  </div>
                </div>
                
                {battleResult && (
                  <div className="mt-4 p-3 bg-yellow-900/30 rounded border border-yellow-500/30">
                    <p className=" text-yellow-200" style={{textAlign: "center"}}>{battleResult}</p>
                  </div>
                )}
              </div>
            )}

            {/* Necromancer's Reaction */}
            <div className="  bg-red-900/20 rounded-lg p-4 border border-red-500/30" className="mb-6" style={{textAlign: "center"}}>
              <p className="text-red-300 italic">"{getNecromancerReaction()}"</p>
            </div>

            {/* Player's Hand */}
            {gamePhase === "player-turn" && (
              <div>
                <h3 className="text-xl font-bold mb-4  text-blue-400" style={{textAlign: "center"}}>Choose Your Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {playerHand.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => selectPlayerCard(card)}
                      className="bg-blue-900/30 hover:bg-blue-800/50 rounded-lg p-4 border border-blue-500/30 transition-all hover:scale-105 text-left"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{card.icon}</span>
                        <div>
                          <div className="font-bold text-blue-400">{card.name}</div>
                          <div className="text-lg text-white">Power: {card.power}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 mb-2">{card.description}</div>
                      <div className="text-xs text-blue-300">{card.effect}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Necromancer's Hand (hidden) */}
            {necromancerHand.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4  text-red-400" style={{textAlign: "center"}}>Necromancer's Hand</h3>
                <div className="flex justify-center gap-2">
                  {necromancerHand.map((_, index) => (
                    <div
                      key={index}
                      className="w-16 h-20 bg-red-900/30 rounded border border-red-500/30 flex items-center justify-center"
                    >
                      <span className="text-2xl">🂠</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(gamePhase === "victory" || gamePhase === "defeat") && (
          <div style={{textAlign: "center"}}>
            <div className={`bg-black/50 backdrop-blur-sm p-8 rounded-lg border mb-6 ${
              gamePhase === "victory" ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'
            }`}>
              <div className="mb-6">
                <span className="text-8xl">
                  {gamePhase === "victory" ? "👑" : "💀"}
                </span>
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${
                gamePhase === "victory" ? 'text-green-400' : 'text-red-400'
              }`}>
                {gamePhase === "victory" ? "VICTORY!" : "DEFEAT!"}
              </h2>
              
              <p className="text-gray-300 mb-4">
                {gamePhase === "victory" 
                  ? "You have bested the necromancer with cunning and strategy!" 
                  : "The necromancer's dark power has overwhelmed you..."}
              </p>
              
              <div className="  bg-gray-800/50 rounded-lg p-4" className="mb-6" style={{textAlign: "center"}}>
                <div className="text-lg font-bold text-purple-400 mb-2">Final Score</div>
                <div className="flex justify-center gap-8">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{playerScore}</div>
                    <div className="text-sm text-gray-400">Player</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{necromancerScore}</div>
                    <div className="text-sm text-gray-400">Necromancer</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={startGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                >
                  Play Again
                </Button>
                <Link href="/game/headquarters" className="no-underline">
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 w-full">
                    Return to Main Game
                  </Button>
                </Link>
              </div>
            </div>

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="mt-6 bg-gray-800/30 rounded-lg p-4 border border-gray-600">
                <h3 className="text-lg font-bold text-purple-400 mb-3">Battle History</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {gameHistory.map((result, index) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-gray-700/30 rounded">
                      Round {index + 1}: {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}