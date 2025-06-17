import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const ingredients = [
  { id: "potion-1", name: "Easther of Wood Rossen", description: "A botanical distillate no druid will take credit for.", icon: "sidequests/curse-crafting/potion-1.png" },
  { id: "potion-2", name: "Sneaker Worn Sock Lint", description: "Harvested from gym bags left overnight in warm cars.", icon: "sidequests/curse-crafting/potion-2.png" },
  { id: "potion-3", name: "Forgotten Credit Score", description: "Whispered by rejected loan officers in the dead of night.", icon: "sidequests/curse-crafting/potion-3.png" },
  { id: "potion-4", name: "Screaming Mushroom Extract", description: "Stored in a jar to keep the volume down.", icon: "sidequests/curse-crafting/potion-4.png" },
  { id: "potion-5", name: "Pickled Moonbeam", description: "Softly glowing. Slightly fermented. Faintly accusatory.", icon: "sidequests/curse-crafting/potion-5.png" },
  { id: "potion-6", name: "Whisper of Goat Spite", description: "Still resentful about that one time in 2013.", icon: "sidequests/curse-crafting/potion-6.png" },
  { id: "potion-7", name: "Dust from a Forgotten Sibling", description: "Don't ask whose. Or why it's still warm.", icon: "sidequests/curse-crafting/potion-7.png" },
  { id: "potion-8", name: "Cursed Caffeine Residue", description: "Found beneath an intern's eyelid. Do not microwave.", icon: "sidequests/curse-crafting/potion-8.png" },
  { id: "potion-9", name: "Banshee's Final Breath", description: "Smells like drama and singed lace.", icon: "sidequests/curse-crafting/potion-9.png" },
  { id: "potion-10", name: "Melted Plastic Halloween Fang", description: "Surprisingly chewy. Ghosts hate it.", icon: "sidequests/curse-crafting/potion-10.png" },
  { id: "potion-11", name: "Cat Hair from Another Timeline", description: "Somehow allergic to itself.", icon: "sidequests/curse-crafting/potion-11.png" },
  { id: "potion-12", name: "Spoiled Fortune Cookie", description: ""Your doom is near." Reads the fortune.", icon: "sidequests/curse-crafting/potion-12.png" },
  { id: "potion-13", name: "Phantom Glitter", description: "Never leaves. Especially not your soul.", icon: "sidequests/curse-crafting/potion-13.png" },
  { id: "potion-14", name: "Eye of Newt, Store Brand™", description: "Budget-friendly. Mildly effective. Not FDA approved.", icon: "sidequests/curse-crafting/potion-14.png" },
  { id: "potion-15", name: "Essence of Teen Angst", description: "Bottled during Mercury retrograde. Handle with eye-rolls.", icon: "sidequests/curse-crafting/potion-15.png" },
  { id: "potion-16", name: "Frog Tears", description: "Extracted under emotional duress. Slightly minty.", icon: "sidequests/curse-crafting/potion-16.png" },
  { id: "potion-17", name: "Graveyard Dew", description: "Collected by moonlight and regret. Keep refrigerated.", icon: "sidequests/curse-crafting/potion-17.png" },
  { id: "potion-18", name: "Secondhand Hex Smoke", description: "Smells like thrift-store incense and broken promises.", icon: "sidequests/curse-crafting/potion-18.png" },
];

interface Ingredient {
  id: string;
  name: string;
  description: string;
  icon: string;
}

type GamePhase = "intro" | "brewing" | "result";

export function CurseCrafting() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("intro");
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [brewedCurse, setBrewedCurse] = useState<string>("");
  const [curseName, setCurseName] = useState<string>("");

  const initializeGame = () => {
    setGamePhase("brewing");
    setSelectedIngredients([]);
    // Randomly select 8 ingredients for this session
    const shuffled = [...ingredients].sort(() => Math.random() - 0.5);
    setAvailableIngredients(shuffled.slice(0, 8));
  };

  const addIngredient = (ingredient: Ingredient) => {
    if (selectedIngredients.length < 3 && !selectedIngredients.find(i => i.id === ingredient.id)) {
      setSelectedIngredients(prev => [...prev, ingredient]);
    }
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => prev.filter(i => i.id !== ingredientId));
  };

  const brewCurse = () => {
    if (selectedIngredients.length === 0) return;
    
    setGamePhase("result");
    
    // Generate curse based on selected ingredients
    const curseEffects = generateCurseEffect(selectedIngredients);
    setBrewedCurse(curseEffects.description);
    setCurseName(curseEffects.name);
  };

  const generateCurseEffect = (ingredients: Ingredient[]) => {
    const curseNames = [
      "Curse of Perpetual Inconvenience",
      "Hex of Minor Embarrassment", 
      "Spell of Forgotten Names",
      "Jinx of Misplaced Keys",
      "Curse of Lukewarm Coffee",
      "Hex of Tangled Earbuds",
      "Spell of Traffic Light Timing",
      "Curse of Autocorrect Betrayal"
    ];

    const effects = [
      "Your victim will always be one minute late to everything important.",
      "Every photo they take will be slightly blurry, no matter what.",
      "They'll forget people's names immediately after being introduced.",
      "Their phone battery will always die at 23% charge.",
      "Every drink they order will be served at room temperature.",
      "They'll always get the shopping cart with the wonky wheel.",
      "Their socks will mysteriously disappear from the laundry.",
      "They'll always hit every red light on their way to work."
    ];

    const randomName = curseNames[Math.floor(Math.random() * curseNames.length)];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];

    return {
      name: randomName,
      description: randomEffect
    };
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4 bg-gradient-to-b from-purple-900 via-green-900 to-black">
      {/* Mystical background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-green-500 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-500 rounded-full blur-xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-green-300 mb-4 drop-shadow-lg">
            CURSE CRAFTING
          </h1>
          <p className="text-lg md:text-xl text-green-200 drop-shadow-md">
            Brew the perfect curse from mystical ingredients!
          </p>
        </div>

        {gamePhase === "intro" && (
          <div className="text-center mb-8">
            <div className="bg-black/80 border border-green-500 rounded-lg p-6 md:p-8 max-w-md mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
                Welcome to the Curse Laboratory
              </h2>
              <p className="text-base md:text-lg text-green-200 mb-4">
                Select ingredients to brew a custom curse. Each combination creates unique magical effects!
              </p>
              <div className="text-sm md:text-base text-green-300 mb-6 space-y-2">
                <p>• Choose up to 3 ingredients from the mystical pantry</p>
                <p>• Each ingredient adds its own dark energy</p>
                <p>• Brew your curse and witness its power</p>
                <p>• Experiment with different combinations!</p>
              </div>
              
              <Button
                onClick={initializeGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Enter the Laboratory
              </Button>
            </div>
          </div>
        )}

        {gamePhase === "brewing" && (
          <>
            {/* Cauldron and Selected Ingredients */}
            <div className="text-center mb-8">
              <div className="bg-black/80 border border-green-500 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-4">
                  Brewing Cauldron ({selectedIngredients.length}/3)
                </h3>
                
                {selectedIngredients.length === 0 ? (
                  <p className="text-green-300 italic">Select ingredients to begin brewing...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {selectedIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="bg-purple-900/50 border border-purple-400 rounded-lg p-3 cursor-pointer hover:bg-purple-800/50 transition-colors"
                        onClick={() => removeIngredient(ingredient.id)}
                      >
                        <img 
                          src={ingredient.icon} 
                          alt={ingredient.name}
                          className="w-12 h-12 mx-auto mb-2 object-contain"
                        />
                        <h4 className="text-sm font-bold text-purple-300 mb-1">{ingredient.name}</h4>
                        <p className="text-xs text-purple-200">{ingredient.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedIngredients.length > 0 && (
                  <Button
                    onClick={brewCurse}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Brew Curse
                  </Button>
                )}
              </div>
            </div>

            {/* Available Ingredients */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-green-300 text-center mb-6">
                Mystical Pantry
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableIngredients.map((ingredient) => {
                  const isSelected = selectedIngredients.find(i => i.id === ingredient.id);
                  const isDisabled = selectedIngredients.length >= 3 && !isSelected;
                  
                  return (
                    <div
                      key={ingredient.id}
                      className={`bg-black/60 border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-purple-400 bg-purple-900/50' 
                          : isDisabled
                            ? 'border-gray-600 opacity-50 cursor-not-allowed'
                            : 'border-green-500 hover:border-green-400 hover:bg-green-900/30 transform hover:scale-105'
                      }`}
                      onClick={() => !isDisabled && addIngredient(ingredient)}
                    >
                      <img 
                        src={ingredient.icon} 
                        alt={ingredient.name}
                        className="w-16 h-16 mx-auto mb-3 object-contain"
                      />
                      <h4 className="text-sm font-bold text-green-300 mb-2 text-center">{ingredient.name}</h4>
                      <p className="text-xs text-green-200 text-center">{ingredient.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {gamePhase === "result" && (
          <div className="text-center mb-8">
            <div className="bg-black/80 border border-purple-500 rounded-lg p-6 md:p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-4">
                Curse Successfully Brewed!
              </h2>
              
              <div className="bg-purple-900/50 border border-purple-400 rounded-lg p-6 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-purple-300 mb-3">
                  {curseName}
                </h3>
                <p className="text-base md:text-lg text-purple-200 italic">
                  "{brewedCurse}"
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-purple-300 mb-3">Ingredients Used:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="text-center">
                      <img 
                        src={ingredient.icon} 
                        alt={ingredient.name}
                        className="w-12 h-12 mx-auto mb-2 object-contain"
                      />
                      <p className="text-sm text-purple-200">{ingredient.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={initializeGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Brew Another Curse
                </Button>
                <Link href="/game/headquarters">
                  <Button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                    Return to Main Game
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}