import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface MonsterData {
  name: string;
  type: string;
  power: number;
  weakness: string;
  origin: string;
}

function generateMonster(): MonsterData {
  const prefixes = [
    'Shadow', 'Blood', 'Crimson', 'Dark', 'Void', 'Bone', 'Soul', 'Night', 'Death', 'Frost',
    'Flame', 'Storm', 'Venomous', 'Cursed', 'Wicked', 'Haunted', 'Spectral', 'Ghastly', 'Dire', 'Savage'
  ];
  
  const bases = [
    'Stalker', 'Reaper', 'Fiend', 'Beast', 'Wraith', 'Demon', 'Horror', 'Terror', 'Nightmare', 'Phantom',
    'Crawler', 'Lurker', 'Hunter', 'Predator', 'Slasher', 'Ripper', 'Howler', 'Screamer', 'Devourer', 'Destroyer'
  ];
  
  const types = [
    'Undead Abomination', 'Demonic Entity', 'Supernatural Predator', 'Cursed Spirit', 'Eldritch Horror',
    'Vampiric Creature', 'Lycanthropic Beast', 'Spectral Apparition', 'Infernal Spawn', 'Cosmic Terror'
  ];
  
  const weaknesses = [
    'Holy Water', 'Silver', 'Sunlight', 'Salt Circles', 'Iron', 'Blessed Objects', 'Fire', 'Mirrors',
    'Running Water', 'Pure Hearts', 'Ancient Symbols', 'Sacred Ground', 'Moonlight', 'Cold Iron'
  ];
  
  const origins = [
    'Ancient Cemetery', 'Haunted Forest', 'Abandoned Hospital', 'Cursed Mansion', 'Dark Swamp',
    'Underground Catacombs', 'Forgotten Temple', 'Shadowy Alley', 'Misty Moor', 'Desolate Wasteland'
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const base = bases[Math.floor(Math.random() * bases.length)];
  
  return {
    name: `${prefix} ${base}`,
    type: types[Math.floor(Math.random() * types.length)],
    power: Math.floor(Math.random() * 90) + 10,
    weakness: weaknesses[Math.floor(Math.random() * weaknesses.length)],
    origin: origins[Math.floor(Math.random() * origins.length)]
  };
}

export function MonsterNameGenerator() {
  const [, setLocation] = useLocation();
  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showMonsterCard, setShowMonsterCard] = useState(false);
  const [showMonsterName, setShowMonsterName] = useState(false);

  const handleGenerate = () => {
    setIsScanning(true);
    setShowMonsterCard(false);
    setShowMonsterName(false);
    
    setTimeout(() => {
      setShowMonsterCard(true);
      
      setTimeout(() => {
        const newMonster = generateMonster();
        setMonster(newMonster);
        setShowMonsterName(true);
        setIsScanning(false);
      }, 2000);
    }, 1000);
  };

  const resetGenerator = () => {
    setMonster(null);
    setIsScanning(false);
    setShowMonsterCard(false);
    setShowMonsterName(false);
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}
      </style>
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
        
        {/* Background particles */}
        <div style={{ position: 'absolute', inset: '0', opacity: '0.2' }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse 2s infinite ${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div style={{ position: 'relative', zIndex: '10', textAlign: 'center', padding: '2rem 0' }}>
          <h1 
            style={{ 
              fontSize: 'clamp(2rem, 8vw, 4rem)',
              fontWeight: 'bold',
              color: '#10b981',
              textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
              marginBottom: '1rem',
              fontFamily: 'Creepster, system-ui, sans-serif'
            }}
          >
            Monster Name Generator
          </h1>
          
          <p style={{ 
            color: '#e2e8f0', 
            fontSize: 'clamp(1rem, 4vw, 1.5rem)', 
            marginBottom: '2rem',
            textShadow: '0 0 10px rgba(0,0,0,0.8)'
          }}>
            Scan your specimen for cryptid classification
          </p>
        </div>

        {/* Scanning Animation */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
            animation: 'scanline 4s linear infinite',
            zIndex: '20'
          }}>
            <style>
              {`
                @keyframes scanline {
                  0% { transform: translateY(0vh); }
                  100% { transform: translateY(100vh); }
                }
              `}
            </style>
          </div>
        )}

        {/* Dr. Heinous Character */}
        <div style={{
          position: 'absolute',
          top: '120px',
          left: '50px',
          zIndex: '15'
        }}>
          <img 
            src="/heinous/presenting.png" 
            alt="Dr. Heinous" 
            style={{
              width: '120px',
              height: 'auto',
              filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '-60px',
            left: '120px',
            background: 'rgba(16, 185, 129, 0.9)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            textShadow: '0 0 5px rgba(0,0,0,0.8)',
            whiteSpace: 'nowrap'
          }}>
            Hold still. This won't hurt... much.
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          flex: '1', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          zIndex: '10',
          padding: '2rem'
        }}>
          
          {/* Monster Card Visual */}
          <div 
            style={{
              opacity: showMonsterCard ? 1 : 0,
              transform: showMonsterCard ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.5s ease'
            }}
          >
            <div style={{
              width: '200px',
              height: '260px',
              margin: '0 auto 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              borderRadius: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              color: '#10b981',
              position: 'relative',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
            }}>
              {/* Monster Silhouette */}
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#374151',
                borderRadius: '50%',
                marginBottom: '1rem',
                opacity: '0.6',
                position: 'relative'
              }}>
                {/* Glowing Eyes */}
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '20px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #10b981',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  right: '20px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #10b981',
                  animation: 'pulse 2s infinite'
                }}></div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '0.5rem',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#10b981'
              }}>
                CLASSIFIED<br />
                SPECIMEN DATA
              </div>
            </div>
          </div>

          {/* Monster Details */}
          {monster && showMonsterName && (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '2px solid #10b981',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              maxWidth: '400px',
              backdropFilter: 'blur(10px)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '1rem',
                textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
              }}>
                {monster.name}
              </h2>
              
              <div style={{ color: '#e2e8f0', fontSize: '0.875rem', textAlign: 'left' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#10b981' }}>Type:</strong> {monster.type}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#10b981' }}>Power Level:</strong> {monster.power}/100
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#10b981' }}>Weakness:</strong> {monster.weakness}
                </p>
                <p>
                  <strong style={{ color: '#10b981' }}>Origin:</strong> {monster.origin}
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <button
            onClick={handleGenerate}
            disabled={isScanning}
            style={{ 
              padding: '1rem 2rem',
              background: 'linear-gradient(to right, #059669, #047857)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              borderRadius: '0.5rem',
              border: '2px solid #10b981',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              opacity: isScanning ? 0.5 : 1,
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              transform: 'scale(1)',
              transition: 'all 0.2s ease',
              marginTop: '2rem'
            }}
            onMouseEnter={(e) => {
              if (!isScanning) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'linear-gradient(to right, #10b981, #059669)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isScanning) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'linear-gradient(to right, #059669, #047857)';
              }
            }}
          >
            {isScanning ? 'SCANNING...' : 'GENERATE MONSTER'}
          </button>

          {monster && (
            <button
              onClick={resetGenerator}
              style={{ 
                padding: '1rem 2rem',
                background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.125rem',
                borderRadius: '0.5rem',
                border: '2px solid #ef4444',
                cursor: 'pointer',
                textShadow: '0 0 10px rgba(0,0,0,0.5)',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                transform: 'scale(1)',
                transition: 'all 0.2s ease',
                marginTop: '1rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
              }}
            >
              RESET
            </button>
          )}

          <button
            onClick={() => setLocation('/game/headquarters')}
            style={{ 
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              borderRadius: '0.5rem',
              border: '2px solid #8b5cf6',
              cursor: 'pointer',
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
              transform: 'scale(1)',
              transition: 'all 0.2s ease',
              marginTop: '2rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.background = 'linear-gradient(to right, #8b5cf6, #7c3aed)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'linear-gradient(to right, #7c3aed, #6d28d9)';
            }}
          >
            Return to Game
          </button>
        </div>
      </div>
    </>
  );
}