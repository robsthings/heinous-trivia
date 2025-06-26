import React, { useState, useEffect } from 'react';

interface MonsterData {
  name: string;
  type: string;
  power: number;
  weakness: string;
  origin: string;
}

const adjectives = [
  'Terrifying', 'Ancient', 'Cursed', 'Bloodthirsty', 'Sinister', 'Ghastly', 'Malevolent',
  'Spectral', 'Putrid', 'Ravenous', 'Vile', 'Wretched', 'Demonic', 'Abyssal', 'Nightmarish'
];

const nouns = [
  'Beast', 'Demon', 'Wraith', 'Fiend', 'Specter', 'Ghoul', 'Phantom', 'Banshee',
  'Reaper', 'Shade', 'Horror', 'Revenant', 'Lurker', 'Stalker', 'Devourer'
];

const suffixes = [
  'of Doom', 'the Destroyer', 'from Beyond', 'of Shadows', 'the Damned',
  'of the Abyss', 'the Cursed', 'from Hell', 'the Nightmare', 'of Death'
];

const types = ['Undead', 'Demon', 'Spirit', 'Beast', 'Eldritch Horror'];
const weaknesses = ['Holy Water', 'Silver', 'Salt Circle', 'Sunlight', 'Iron', 'Sacred Ground'];
const origins = ['Ancient Cemetery', 'Abandoned Asylum', 'Cursed Forest', 'Dark Dimension', 'Forgotten Crypt'];

function generateMonster(): MonsterData {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return {
    name: `${adjective} ${noun} ${suffix}`,
    type: types[Math.floor(Math.random() * types.length)],
    power: Math.floor(Math.random() * 100) + 1,
    weakness: weaknesses[Math.floor(Math.random() * weaknesses.length)],
    origin: origins[Math.floor(Math.random() * origins.length)]
  };
}

export function MonsterNameGenerator() {
  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setMonster(null);

    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setIsScanning(false);
          setMonster(generateMonster());
          return 100;
        }
        return prev + 2;
      });
    }, 80);
  };

  const resetGenerator = () => {
    setMonster(null);
    setScanProgress(0);
    setIsScanning(false);
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: "'Creepster', cursive"
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 text-center py-8">
        <h1 
          className="text-4xl md:text-6xl font-bold text-green-400 mb-4"
          style={{ textShadow: '0 0 20px #10b981', fontFamily: 'Creepster, cursive' }}
        >
          MONSTER GENERATOR
        </h1>
        <p className="text-lg text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          Summon creatures from the darkest depths
        </p>
      </div>

      {/* Dr. Heinous sprite */}
      <div className="absolute top-16 right-8 z-20">
        <img 
          src="/heinous/scheming.png" 
          alt="Dr. Heinous" 
          className="w-20 h-20 md:w-24 md:h-24"
        />
        <div className="absolute -left-32 top-2 bg-black bg-opacity-80 text-green-400 text-sm px-3 py-2 rounded-lg border border-green-400">
          Hold still. This won't hurt... much.
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        
        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="text-center">
              <div className="text-6xl text-green-400 mb-4 animate-pulse">
                SCANNING...
              </div>
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-400 transition-all duration-300"
                  style={{ 
                    width: `${scanProgress}%`,
                    boxShadow: '0 0 10px #10b981'
                  }}
                />
              </div>
              <div className="text-green-400 mt-2">{scanProgress}%</div>
            </div>
          </div>
        )}

        {/* Scan line animation */}
        {isScanning && (
          <div 
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80 z-20"
            style={{
              top: `${(scanProgress / 100) * 100}%`,
              boxShadow: '0 0 20px #10b981',
              transition: 'top 0.1s linear'
            }}
          />
        )}

        {/* Monster card */}
        {monster && !isScanning && (
          <div 
            className="bg-black bg-opacity-80 border-2 border-green-400 rounded-lg p-8 max-w-lg w-full mx-4 transform scale-0 animate-[scaleIn_0.5s_ease-out_forwards]"
            style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-6 text-center" style={{ fontFamily: 'Nosifer, cursive' }}>
              {monster.name}
            </h2>
            
            <div className="space-y-4 text-gray-300" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <div className="flex justify-between">
                <span className="text-green-400">Type:</span>
                <span>{monster.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Power Level:</span>
                <span className="text-red-400 font-bold">{monster.power}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Weakness:</span>
                <span>{monster.weakness}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Origin:</span>
                <span>{monster.origin}</span>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={startScan}
            disabled={isScanning}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold text-lg rounded-lg border-2 border-green-400 hover:from-green-500 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            style={{ 
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {isScanning ? 'SCANNING...' : 'GENERATE MONSTER'}
          </button>

          {monster && (
            <button
              onClick={resetGenerator}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-lg rounded-lg border-2 border-red-400 hover:from-red-500 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              style={{ 
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              RESET
            </button>
          )}
        </div>

        {/* Return button */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold rounded-lg border-2 border-purple-400 hover:from-purple-500 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          style={{ 
            textShadow: '0 0 10px rgba(0,0,0,0.5)',
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Return to Game
        </button>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}