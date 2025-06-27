import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import html2canvas from "html2canvas";


// Base ingredient data without hardcoded paths
const ingredientData = [
  { id: "potion-1", name: "Easther of Wood Rossen", description: "A botanical distillate no druid will take credit for." },
  { id: "potion-2", name: "Sneaker Worn Sock Lint", description: "Harvested from gym bags left overnight in warm cars." },
  { id: "potion-3", name: "Forgotten Credit Score", description: "Whispered by rejected loan officers in the dead of night." },
  { id: "potion-4", name: "Screaming Mushroom Extract", description: "Stored in a jar to keep the volume down." },
  { id: "potion-5", name: "Pickled Moonbeam", description: "Softly glowing. Slightly fermented. Faintly accusatory." },
  { id: "potion-6", name: "Whisper of Goat Spite", description: "Still resentful about that one time in 2013." },
  { id: "potion-7", name: "Dust from a Forgotten Sibling", description: "Don't ask whose. Or why it's still warm." },
  { id: "potion-8", name: "Cursed Caffeine Residue", description: "Found beneath an intern's eyelid. Do not microwave." },
  { id: "potion-9", name: "Banshee's Final Breath", description: "Smells like drama and singed lace." },
  { id: "potion-10", name: "Melted Plastic Halloween Fang", description: "Surprisingly chewy. Ghosts hate it." },
  { id: "potion-11", name: "Cat Hair from Another Timeline", description: "Somehow allergic to itself." },
  { id: "potion-12", name: "Spoiled Fortune Cookie", description: "\"Your doom is near.\" Reads the fortune." },
  { id: "potion-13", name: "Phantom Glitter", description: "Never leaves. Especially not your soul." },
  { id: "potion-14", name: "Eye of Newt, Store Brand™", description: "Budget-friendly. Mildly effective. Not FDA approved." },
  { id: "potion-15", name: "Essence of Teen Angst", description: "Bottled during Mercury retrograde. Handle with eye-rolls." },
  { id: "potion-16", name: "Frog Tears", description: "Extracted under emotional duress. Slightly minty." },
  { id: "potion-17", name: "Graveyard Dew", description: "Collected by moonlight and regret. Keep refrigerated." },
  { id: "potion-18", name: "Secondhand Hex Smoke", description: "Smells like thrift-store incense and broken promises." },
];

interface Ingredient {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface GeneratedCurse {
  curse: string;
  target: string;
  sideEffect?: string;
}

const curseTemplates = [
  ({ object, action, result }: { object: string; action: string; result: string }) =>
    `May every ${object} they ${action} turn into ${result}.`,
  ({ action, result }: { action: string; result: string }) =>
    `Whenever they ${action}, they hear the sound of ${result}.`,
  ({ bodyPart, result }: { bodyPart: string; result: string }) =>
    `May their ${bodyPart} develop an uncontrollable craving for ${result}.`,
  ({ objectPlural, absurdity }: { objectPlural: string; absurdity: string }) =>
    `May ${objectPlural} follow them, whispering secrets about ${absurdity}.`,
  ({ result }: { result: string }) =>
    `May they forever smell faintly of ${result}, no matter how hard they scrub.`,
];

const curseTargets = [
  "your old gym teacher",
  "your middle school nemesis",
  "that one barista who judged you",
  "your ex's new partner",
  "the cousin who ruined game night",
  "someone who calls you 'buddy' in a condescending tone",
  "your least favorite coworker",
  "an influencer who faked a haunting",
  "your unfinished tax return",
  "a guy named Chad (he knows what he did)",
];

const sideEffects = [
  "Also, mild goat noises.",
  "And yet, still somehow smug.",
  "Now banned from using elevators.",
  "They must explain NFTs at every party.",
  "Everything tastes faintly like pennies.",
  "Uncontrollable kazoo solos under pressure.",
  "Their phone autocorrects to embarrassing typos.",
  "Haunted by the scent of ham.",
  "They cry whenever they hear a kazoo.",
  "Pants slightly tighter every Tuesday.",
];

// Wordbanks
const wordbanks = {
  object: ["shoelace", "sandwich", "text message", "door handle", "thought"],
  objectPlural: ["clocks", "plastic lawn gnomes", "sentient loofahs", "ants"],
  action: ["touch", "eat", "clean", "tie", "whisper to"],
  result: ["live worms", "wet socks", "expired mayo", "glitter vomit", "tiny bees"],
  absurdity: ["ancient cheese politics", "your browser history", "haunted fonts"],
  bodyPart: ["elbow", "left nostril", "knee", "pinky toe", "eyelid"],
};

function generateCurse() {
  const template =
    curseTemplates[Math.floor(Math.random() * curseTemplates.length)];

  const data = {
    object: rand(wordbanks.object),
    objectPlural: rand(wordbanks.objectPlural),
    action: rand(wordbanks.action),
    result: rand(wordbanks.result),
    absurdity: rand(wordbanks.absurdity),
    bodyPart: rand(wordbanks.bodyPart),
  };

  const curseText = template(data);
  const target = `Target: ${rand(curseTargets)}`;
  const sideEffect = rand(sideEffects);

  return {
    curseText,
    target,
    sideEffect,
  };
}

function rand(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function CurseCrafting() {
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [cauldronIngredients, setCauldronIngredients] = useState<Ingredient[]>([]);
  const [draggedIngredient, setDraggedIngredient] = useState<Ingredient | null>(null);
  const [hoveredIngredient, setHoveredIngredient] = useState<Ingredient | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [gamePhase, setGamePhase] = useState<'selecting' | 'brewing' | 'revealing'>('selecting');
  const [generatedCurse, setGeneratedCurse] = useState<GeneratedCurse | null>(null);



  // Create ingredients with existing asset fallbacks
  const ingredients = ingredientData.map(item => ({
    ...item,
    icon: `/heinous/gift.png` // Use existing gift asset as fallback
  }));

  // Initialize with 8 random ingredients on component mount
  useEffect(() => {
    const shuffled = [...ingredients].sort(() => Math.random() - 0.5);
    setAvailableIngredients(shuffled.slice(0, 8));
  }, []);

  const handleIngredientClick = (ingredient: Ingredient) => {
    if (selectedIngredients.find(i => i.id === ingredient.id)) {
      // Deselect if already selected
      setSelectedIngredients(prev => prev.filter(i => i.id !== ingredient.id));
    } else if (selectedIngredients.length < 3) {
      // Select if under limit
      setSelectedIngredients(prev => [...prev, ingredient]);
    }
  };

  const handleDragStart = (e: React.DragEvent, ingredient: Ingredient) => {
    setDraggedIngredient(ingredient);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIngredient(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIngredient && cauldronIngredients.length < 3) {
      if (!cauldronIngredients.find(i => i.id === draggedIngredient.id)) {
        setCauldronIngredients(prev => [...prev, draggedIngredient]);
        // Remove from selected ingredients
        setSelectedIngredients(prev => prev.filter(i => i.id !== draggedIngredient.id));
      }
    }
    setDraggedIngredient(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const stirIrresponsibly = () => {
    const curse = generateCurse();
    setGeneratedCurse({
      curse: curse.curseText,
      target: curse.target,
      sideEffect: curse.sideEffect
    });
    setGamePhase('revealing');
  };

  const craftAgain = () => {
    // Reset everything and generate new ingredients
    const shuffled = [...ingredients].sort(() => Math.random() - 0.5);
    setAvailableIngredients(shuffled.slice(0, 8));
    setSelectedIngredients([]);
    setCauldronIngredients([]);
    setGeneratedCurse(null);
    setGamePhase('selecting');
  };

  const captureScrollScreenshot = async () => {
    const scrollElement = document.getElementById('curse-scroll-container');
    if (scrollElement) {
      try {
        const canvas = await html2canvas(scrollElement, {
          backgroundColor: 'transparent',
          scale: 2,
          logging: false
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'cursed-scroll.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Screenshot failed:', error);
      }
    }
  };

  return (
    <div 
      
      style={{
        backgroundImage: 'url(/sidequests/curse-crafting/cursed-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Ingredient Grid - Top of screen - Hidden during reveal */}
      <div style={{display: gamePhase === 'reveal' ? 'none' : 'block'}}>
        <div style={{padding: '1rem'}}>
          <h1 style={{textAlign: "center", fontFamily: 'Eater, cursive', color: '#39ff14', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '1rem'}}>
            CURSE CRAFTING
          </h1>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxWidth: '32rem', margin: '0 auto'}}>
            {availableIngredients.map((ingredient) => {
              const isSelected = selectedIngredients.find(i => i.id === ingredient.id);
              const isInCauldron = cauldronIngredients.find(i => i.id === ingredient.id);
              const isDragging = draggedIngredient?.id === ingredient.id;
              
              return (
                <div
                  key={ingredient.id}
                  style={{
                    position: 'relative',
                    cursor: isInCauldron ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: isDragging ? 'scale(1.1) rotate(3deg)' : 'scale(1)',
                    opacity: isInCauldron ? 0.5 : 1,
                    filter: isInCauldron ? 'grayscale(1)' : 'none',
                    pointerEvents: isInCauldron ? 'none' : 'auto',
                    border: isSelected ? '2px solid #c084fc' : 'none',
                    backgroundColor: isSelected ? 'rgba(88, 28, 135, 0.3)' : 'transparent',
                    borderRadius: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isInCauldron && !isSelected) {
                      e.currentTarget.style.border = '2px solid #4ade80';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                    setHoveredIngredient(ingredient);
                  }}
                  onMouseLeave={(e) => {
                    if (!isInCauldron && !isSelected) {
                      e.currentTarget.style.border = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                    setHoveredIngredient(null);
                  }}
                  draggable={isSelected && !isInCauldron}
                  onClick={() => handleIngredientClick(ingredient)}
                  onDragStart={(e) => isSelected && handleDragStart(e, ingredient)}
                  onDragEnd={handleDragEnd}
                >
                  <div >
                    <img 
                      src={ingredient.icon} 
                      alt={ingredient.name}
                      
                    />
                    <p  style={{textAlign: "center"}}>{ingredient.name}</p>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && !isInCauldron && (
                    <div >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cauldron - Bottom center */}
      <div >
        <div
          className={`relative transition-all duration-300 ${
            draggedIngredient ? 'scale-110 ring-4 ring-purple-400 ring-opacity-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <img 
            src="/heinous/presenting.png"
            alt="Cursed Cauldron"
            
          />
          
          {/* Ingredients in cauldron */}
          {cauldronIngredients.length > 0 && (
            <div >
              {cauldronIngredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <img 
                    src={ingredient.icon} 
                    alt={ingredient.name}
                    
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Cauldron count indicator */}
          <div >
            <span >{cauldronIngredients.length}/3</span>
          </div>
        </div>

        {/* Stir Button - Hidden during reveal */}
        <Button
          onClick={stirIrresponsibly}
          disabled={cauldronIngredients.length !== 3}
          className={`mt-4 px-8 py-3 text-lg font-bold rounded-lg shadow-lg transition-all duration-1000 ${
            gamePhase === 'revealing' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          } ${
            cauldronIngredients.length === 3
              ? 'bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Stir Irresponsibly
        </Button>
      </div>

      {/* Tooltip */}
      {hoveredIngredient && (
        <div
          
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 60,
          }}
        >
          <div >
            <h4 >{hoveredIngredient.name}</h4>
            <p >{hoveredIngredient.description}</p>
          </div>
        </div>
      )}

      {/* Scroll Reveal Animation */}
      {gamePhase === 'revealing' && generatedCurse && (
        <div >
          <div id="curse-scroll-container" >
            {/* Toxic Green Glow Background */}
            <div ></div>
            
            {/* Scroll Image */}
            <img 
              id="curse-scroll"
              src="/backgrounds/lab-dark-blue.png"
              alt="Cursed Scroll"
              
            />
            
            {/* Curse Text Overlay */}
            <div >
              <div  style={{textAlign: "center"}}>
                {/* Main Curse */}
                <p >
                  {generatedCurse.curse}
                </p>
                
                {/* Target */}
                <p >
                  — Upon {generatedCurse.target}
                </p>
                
                {/* Side Effect */}
                {generatedCurse.sideEffect && (
                  <p >
                    {generatedCurse.sideEffect}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div >
              <Button
                onClick={captureScrollScreenshot}
                
              >
                📸 Screenshot
              </Button>
              <Button
                onClick={craftAgain}
                
              >
                🔁 Craft Again
              </Button>
              <Link href="/game">
                <Button 
                  style={{
                    background: 'linear-gradient(to right, #374151, #4b5563)',
                    color: '#ffffff',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transform: 'scale(1)',
                    transition: 'all 0.2s ease',
                    border: '1px solid #6b7280'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #4b5563, #6b7280)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #374151, #4b5563)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ← Return to Game
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}