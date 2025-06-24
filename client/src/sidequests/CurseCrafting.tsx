import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import html2canvas from "html2canvas";

const ingredients = [
  { id: "potion-1", name: "Easther of Wood Rossen", description: "A botanical distillate no druid will take credit for.", icon: "/sidequests/curse-crafting/potion-1.png" },
  { id: "potion-2", name: "Sneaker Worn Sock Lint", description: "Harvested from gym bags left overnight in warm cars.", icon: "/sidequests/curse-crafting/potion-2.png" },
  { id: "potion-3", name: "Forgotten Credit Score", description: "Whispered by rejected loan officers in the dead of night.", icon: "/sidequests/curse-crafting/potion-3.png" },
  { id: "potion-4", name: "Screaming Mushroom Extract", description: "Stored in a jar to keep the volume down.", icon: "/sidequests/curse-crafting/potion-4.png" },
  { id: "potion-5", name: "Pickled Moonbeam", description: "Softly glowing. Slightly fermented. Faintly accusatory.", icon: "/sidequests/curse-crafting/potion-5.png" },
  { id: "potion-6", name: "Whisper of Goat Spite", description: "Still resentful about that one time in 2013.", icon: "/sidequests/curse-crafting/potion-6.png" },
  { id: "potion-7", name: "Dust from a Forgotten Sibling", description: "Don't ask whose. Or why it's still warm.", icon: "/sidequests/curse-crafting/potion-7.png" },
  { id: "potion-8", name: "Cursed Caffeine Residue", description: "Found beneath an intern's eyelid. Do not microwave.", icon: "/sidequests/curse-crafting/potion-8.png" },
  { id: "potion-9", name: "Banshee's Final Breath", description: "Smells like drama and singed lace.", icon: "/sidequests/curse-crafting/potion-9.png" },
  { id: "potion-10", name: "Melted Plastic Halloween Fang", description: "Surprisingly chewy. Ghosts hate it.", icon: "/sidequests/curse-crafting/potion-10.png" },
  { id: "potion-11", name: "Cat Hair from Another Timeline", description: "Somehow allergic to itself.", icon: "/sidequests/curse-crafting/potion-11.png" },
  { id: "potion-12", name: "Spoiled Fortune Cookie", description: "\"Your doom is near.\" Reads the fortune.", icon: "/sidequests/curse-crafting/potion-12.png" },
  { id: "potion-13", name: "Phantom Glitter", description: "Never leaves. Especially not your soul.", icon: "/sidequests/curse-crafting/potion-13.png" },
  { id: "potion-14", name: "Eye of Newt, Store Brand™", description: "Budget-friendly. Mildly effective. Not FDA approved.", icon: "/sidequests/curse-crafting/potion-14.png" },
  { id: "potion-15", name: "Essence of Teen Angst", description: "Bottled during Mercury retrograde. Handle with eye-rolls.", icon: "/sidequests/curse-crafting/potion-15.png" },
  { id: "potion-16", name: "Frog Tears", description: "Extracted under emotional duress. Slightly minty.", icon: "/sidequests/curse-crafting/potion-16.png" },
  { id: "potion-17", name: "Graveyard Dew", description: "Collected by moonlight and regret. Keep refrigerated.", icon: "/sidequests/curse-crafting/potion-17.png" },
  { id: "potion-18", name: "Secondhand Hex Smoke", description: "Smells like thrift-store incense and broken promises.", icon: "/sidequests/curse-crafting/potion-18.png" },
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
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/sidequests/curse-crafting/cursed-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Ingredient Grid - Top of screen - Hidden during reveal */}
      <div className={`pt-8 px-4 transition-opacity duration-1000 ${gamePhase === 'revealing' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold  mb-8 drop-shadow-lg" style={{textAlign: "center"}} style={{ fontFamily: 'Eater, cursive', color: '#39ff14' }}>
            CURSE CRAFTING
          </h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {availableIngredients.map((ingredient) => {
              const isSelected = selectedIngredients.find(i => i.id === ingredient.id);
              const isInCauldron = cauldronIngredients.find(i => i.id === ingredient.id);
              const isDragging = draggedIngredient?.id === ingredient.id;
              
              return (
                <div
                  key={ingredient.id}
                  className={`relative cursor-pointer transition-all duration-300 transform ${
                    isDragging ? 'scale-110 rotate-3' : 'hover:scale-105'
                  } ${
                    isInCauldron 
                      ? 'opacity-50 grayscale pointer-events-none' 
                      : isSelected 
                        ? 'ring-2 ring-purple-400 bg-purple-900/30' 
                        : 'hover:ring-2 hover:ring-green-400'
                  }`}
                  draggable={isSelected && !isInCauldron}
                  onClick={() => handleIngredientClick(ingredient)}
                  onDragStart={(e) => isSelected && handleDragStart(e, ingredient)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoveredIngredient(ingredient)}
                  onMouseLeave={() => setHoveredIngredient(null)}
                >
                  <div className="bg-black/60 border border-gray-600 rounded-lg p-2 sm:p-3 backdrop-blur-sm">
                    <img 
                      src={ingredient.icon} 
                      alt={ingredient.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 mx-auto object-contain"
                    />
                    <p className="text-xs  text-white mt-2 truncate" style={{textAlign: "center"}}>{ingredient.name}</p>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && !isInCauldron && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <div
          className={`relative transition-all duration-300 ${
            draggedIngredient ? 'scale-110 ring-4 ring-purple-400 ring-opacity-50' : ''
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <img 
            src="/sidequests/curse-crafting/cursed-cauldron.png"
            alt="Cursed Cauldron"
            className="w-48 h-48 sm:w-72 sm:h-72 object-contain"
          />
          
          {/* Ingredients in cauldron */}
          {cauldronIngredients.length > 0 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {cauldronIngredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <img 
                    src={ingredient.icon} 
                    alt={ingredient.name}
                    className="w-full h-full object-contain opacity-80"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Cauldron count indicator */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full">
            <span className="text-white text-sm font-bold">{cauldronIngredients.length}/3</span>
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
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 60,
          }}
        >
          <div className="bg-black/90 border border-purple-400 rounded-lg p-3 max-w-xs backdrop-blur-sm">
            <h4 className="text-purple-300 font-bold text-sm">{hoveredIngredient.name}</h4>
            <p className="text-gray-300 text-xs mt-1">{hoveredIngredient.description}</p>
          </div>
        </div>
      )}

      {/* Scroll Reveal Animation */}
      {gamePhase === 'revealing' && generatedCurse && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div id="curse-scroll-container" className="relative animate-scroll-reveal">
            {/* Toxic Green Glow Background */}
            <div className="absolute inset-0 bg-green-400/30 rounded-full blur-3xl scale-125 animate-pulse"></div>
            
            {/* Scroll Image */}
            <img 
              id="curse-scroll"
              src="/sidequests/curse-crafting/scroll-1.png"
              alt="Cursed Scroll"
              className="w-80 h-96 sm:w-96 sm:h-[28rem] object-contain mx-auto relative z-10"
            />
            
            {/* Curse Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-16 py-20 sm:px-20 sm:py-24 z-20">
              <div className=" space-y-2 max-w-56 sm:max-w-72" style={{textAlign: "center"}}>
                {/* Main Curse */}
                <p className="text-base sm:text-lg font-bold text-gray-800 leading-snug font-serif">
                  {generatedCurse.curse}
                </p>
                
                {/* Target */}
                <p className="text-xs sm:text-sm italic text-gray-900 font-serif">
                  — Upon {generatedCurse.target}
                </p>
                
                {/* Side Effect */}
                {generatedCurse.sideEffect && (
                  <p className="text-xs text-gray-800 font-serif mt-1">
                    {generatedCurse.sideEffect}
                  </p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-3">
              <Button
                onClick={captureScrollScreenshot}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
              >
                📸 Screenshot
              </Button>
              <Button
                onClick={craftAgain}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all"
              >
                🔁 Craft Again
              </Button>
              <Link href="/game/headquarters">
                <Button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform hover:scale-105 transition-all">
                  🧪 Return to Main Game
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}