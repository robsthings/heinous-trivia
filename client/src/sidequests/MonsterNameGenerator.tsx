import { useState } from 'react';
import { useLocation } from 'wouter';

interface MonsterData {
  name: string;
  type: string;
  power: number;
  weakness: string;
  origin: string;
}

function generateMonster(): MonsterData {
  const prefixes = ['Shadow', 'Blood', 'Cursed', 'Bone', 'Night', 'Dark', 'Spectral', 'Grim', 'Void', 'Phantom'];
  const types = ['Wraith', 'Fiend', 'Beast', 'Ghoul', 'Demon', 'Specter', 'Revenant', 'Stalker', 'Horror', 'Entity'];
  const origins = ['Ancient Cemetery', 'Abandoned Asylum', 'Haunted Forest', 'Cursed Mansion', 'Dark Dimension', 'Underground Catacombs'];
  const weaknesses = ['Holy Water', 'Silver Cross', 'Iron Stakes', 'Salt Circles', 'Sunlight', 'Sacred Flames'];
  
  return {
    name: `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${types[Math.floor(Math.random() * types.length)]}`,
    type: types[Math.floor(Math.random() * types.length)],
    power: Math.floor(Math.random() * 100) + 1,
    weakness: weaknesses[Math.floor(Math.random() * weaknesses.length)],
    origin: origins[Math.floor(Math.random() * origins.length)]
  };
}

export function MonsterNameGenerator() {
  const [, setLocation] = useLocation();
  const [monster, setMonster] = useState<MonsterData | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showMonsterCard, setShowMonsterCard] = useState(false);
  const [showMonsterName, setShowMonsterName] = useState(false);

  const startScan = () => {
    console.log('Starting scan...');
    setIsScanning(true);
    setScanProgress(0);
    setMonster(null);
    setShowMonsterCard(false);
    setShowMonsterName(false);

    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        console.log('Scan progress:', prev);
        if (prev >= 100) {
          clearInterval(scanInterval);
          setIsScanning(false);
          
          // First show the monster card
          const newMonster = generateMonster();
          setMonster(newMonster);
          setShowMonsterCard(true);
          
          // Then reveal the name after a short delay
          setTimeout(() => {
            setShowMonsterName(true);
          }, 800);
          
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
    setShowMonsterCard(false);
    setShowMonsterName(false);
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
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
            marginBottom: '1rem',
            textShadow: '0 0 20px #10b981', 
            fontFamily: 'Creepster, cursive' 
          }}
        >
          MONSTER GENERATOR
        </h1>
        <p 
          style={{ 
            fontSize: '1.125rem',
            color: '#d1d5db',
            maxWidth: '32rem',
            margin: '0 auto',
            padding: '0 1rem'
          }}
        >
          Dr. Heinous's experimental creature analysis system
        </p>
      </div>

      {/* Dr. Heinous sprite */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: '20' }}>
        <img 
          src="/heinous/dr-heinous-presenting.png" 
          alt="Dr. Heinous"
          style={{ 
            width: 'clamp(6rem, 10vw, 8rem)', 
            height: 'clamp(6rem, 10vw, 8rem)',
            imageRendering: 'pixelated' 
          }}
        />
      </div>

      {/* Main content */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '0 1rem', 
        position: 'relative', 
        zIndex: '10' 
      }}>
        
        {/* Scanning overlay */}
        {isScanning && (
          <div style={{ 
            position: 'absolute', 
            inset: '0', 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: '20' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '4rem', 
                color: '#10b981', 
                marginBottom: '1rem',
                animation: 'pulse 1s infinite'
              }}>
                SCANNING...
              </div>
              <div style={{ 
                width: '16rem', 
                height: '0.5rem', 
                backgroundColor: '#374151', 
                borderRadius: '9999px', 
                overflow: 'hidden' 
              }}>
                <div 
                  style={{ 
                    height: '100%',
                    backgroundColor: '#10b981',
                    width: `${scanProgress}%`,
                    boxShadow: '0 0 10px #10b981',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              <div style={{ color: '#10b981', marginTop: '0.5rem' }}>{scanProgress}%</div>
            </div>
          </div>
        )}

        {/* Full-width scan line animation */}
        {isScanning && (
          <div 
            style={{
              position: 'fixed',
              left: '0',
              right: '0',
              height: '4px',
              top: `${scanProgress}vh`,
              background: 'linear-gradient(to right, transparent 0%, #10b981 20%, #22c55e 50%, #10b981 80%, transparent 100%)',
              boxShadow: '0 0 30px #10b981, 0 0 60px #10b981',
              filter: 'blur(0.5px)',
              transition: 'top 0.1s linear',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          />
        )}
        
        {/* Additional glow effect for scan line */}
        {isScanning && (
          <div 
            style={{
              position: 'fixed',
              left: '0',
              right: '0',
              height: '12px',
              top: `calc(${scanProgress}vh - 4px)`,
              background: 'linear-gradient(to right, transparent 0%, rgba(16, 185, 129, 0.3) 20%, rgba(34, 197, 94, 0.5) 50%, rgba(16, 185, 129, 0.3) 80%, transparent 100%)',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)',
              transition: 'top 0.1s linear',
              zIndex: 9998,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Monster Card */}
        {showMonsterCard && monster && (
          <div 
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(10px)',
              borderRadius: '1rem',
              border: '2px solid #10b981',
              padding: '2rem',
              maxWidth: '24rem',
              width: '100%',
              margin: '0 1rem',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
              opacity: showMonsterCard ? 1 : 0,
              transform: showMonsterCard ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.5s ease'
            }}
          >
            <h2 
              style={{ 
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '1.5rem',
                textShadow: '0 0 10px #10b981',
                fontFamily: 'Creepster, cursive'
              }}
            >
              {showMonsterName ? monster.name : '???'}
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '1rem', 
              marginTop: '1.5rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.25rem' }}>TYPE</div>
                <div style={{ color: '#d1d5db' }}>{monster.type}</div>
              </div>
              
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.25rem' }}>POWER</div>
                <div style={{ color: '#d1d5db' }}>{monster.power}</div>
              </div>
              
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                gridColumn: 'span 2'
              }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.25rem' }}>WEAKNESS</div>
                <div style={{ color: '#d1d5db' }}>{monster.weakness}</div>
              </div>
              
              <div style={{ 
                padding: '0.5rem', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '0.5rem',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                gridColumn: 'span 2'
              }}>
                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.25rem' }}>ORIGIN</div>
                <div style={{ color: '#d1d5db' }}>{monster.origin}</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={startScan}
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
              transition: 'all 0.2s ease'
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
                transition: 'all 0.2s ease'
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
              transition: 'all 0.2s ease'
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

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}