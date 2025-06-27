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
      <div >
        
        {/* Header */}
        <div   style={{textAlign: "center"}}>
          <h1 >
            NECROMANCER'S GAMBIT
          </h1>
          <p >
            A strategic battle of cards against the forces of darkness
          </p>
        </div>

        {gamePhase === "intro" && (
          <div  style={{textAlign: "center"}}>
            <div >
              <span >💀</span>
            </div>
            <h2 >The Challenge Awaits</h2>
            <p  >
              Face the ancient necromancer in a battle of strategy and cunning. 
              Choose your cards wisely - each has unique powers that can turn the tide of battle.
              First to win 2 rounds claims victory!
            </p>
            <Button 
              onClick={startGame}
              
            >
              Begin the Gambit
            </Button>
          </div>
        )}

        {(gamePhase === "player-turn" || gamePhase === "battle") && (
          <div>
            {/* Score Display */}
            <div  style={{justifyContent: "space-between"}} >
              <div style={{textAlign: "center"}}>
                <div >{playerScore}</div>
                <div >Player Wins</div>
              </div>
              <div style={{textAlign: "center"}}>
                <div >Round {round}</div>
                <div >of 3</div>
              </div>
              <div style={{textAlign: "center"}}>
                <div >{necromancerScore}</div>
                <div >Necromancer Wins</div>
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
                <h3  style={{textAlign: "center"}}>Battle in Progress</h3>
                <div  style={{justifyContent: "space-between"}}>
                  <div  style={{textAlign: "center"}}>
                    <div >{playerSelectedCard.icon}</div>
                    <div >{playerSelectedCard.name}</div>
                    <div >Power: {playerSelectedCard.power}</div>
                    <div >{playerSelectedCard.effect}</div>
                  </div>
                  
                  <div  style={{textAlign: "center"}}>
                    <div >⚔️</div>
                    <div >VS</div>
                  </div>
                  
                  <div  style={{textAlign: "center"}}>
                    <div >{necromancerSelectedCard.icon}</div>
                    <div >{necromancerSelectedCard.name}</div>
                    <div >Power: {necromancerSelectedCard.power}</div>
                    <div >{necromancerSelectedCard.effect}</div>
                  </div>
                </div>
                
                {battleResult && (
                  <div >
                    <p  style={{textAlign: "center"}}>{battleResult}</p>
                  </div>
                )}
              </div>
            )}

            {/* Necromancer's Reaction */}
            <div   style={{textAlign: "center"}}>
              <p >"{getNecromancerReaction()}"</p>
            </div>

            {/* Player's Hand */}
            {gamePhase === "player-turn" && (
              <div>
                <h3  style={{textAlign: "center"}}>Choose Your Card</h3>
                <div >
                  {playerHand.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => selectPlayerCard(card)}
                      
                    >
                      <div >
                        <span >{card.icon}</span>
                        <div>
                          <div >{card.name}</div>
                          <div >Power: {card.power}</div>
                        </div>
                      </div>
                      <div >{card.description}</div>
                      <div >{card.effect}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Necromancer's Hand (hidden) */}
            {necromancerHand.length > 0 && (
              <div >
                <h3  style={{textAlign: "center"}}>Necromancer's Hand</h3>
                <div >
                  {necromancerHand.map((_, index) => (
                    <div
                      key={index}
                      
                    >
                      <span >🂠</span>
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
              <div >
                <span >
                  {gamePhase === "victory" ? "👑" : "💀"}
                </span>
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${
                gamePhase === "victory" ? 'text-green-400' : 'text-red-400'
              }`}>
                {gamePhase === "victory" ? "VICTORY!" : "DEFEAT!"}
              </h2>
              
              <p >
                {gamePhase === "victory" 
                  ? "You have bested the necromancer with cunning and strategy!" 
                  : "The necromancer's dark power has overwhelmed you..."}
              </p>
              
              <div   style={{textAlign: "center"}}>
                <div >Final Score</div>
                <div >
                  <div>
                    <div >{playerScore}</div>
                    <div >Player</div>
                  </div>
                  <div>
                    <div >{necromancerScore}</div>
                    <div >Necromancer</div>
                  </div>
                </div>
              </div>

              <div >
                <Button 
                  onClick={startGame}
                  
                >
                  Play Again
                </Button>
                <Link href="/game/headquarters" >
                  <Button >
                    Return to Main Game
                  </Button>
                </Link>
              </div>
            </div>

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div >
                <h3 >Battle History</h3>
                <div >
                  {gameHistory.map((result, index) => (
                    <div key={index} >
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