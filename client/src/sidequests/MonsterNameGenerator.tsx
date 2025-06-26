import { useState } from 'react';

interface MonsterData {
  name: string;
  type: string;
  power: number;
  weakness: string;
  origin: string;
}

function generateMonster(): MonsterData {
  const prefixes = ['Shadow', 'Blood', 'Dark', 'Void', 'Cursed'];
  const bases = ['Stalker', 'Fiend', 'Beast', 'Wraith', 'Horror'];
  const types = ['Undead Abomination', 'Demonic Entity', 'Supernatural Predator'];
  const weaknesses = ['Holy Water', 'Silver', 'Sunlight', 'Salt Circles'];
  const origins = ['Ancient Cemetery', 'Haunted Forest', 'Abandoned Hospital'];

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
  const [monster, setMonster] = useState<MonsterData | null>(null);

  const handleGenerate = () => {
    const newMonster = generateMonster();
    setMonster(newMonster);
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{
        fontSize: '3rem',
        textAlign: 'center',
        color: '#10b981',
        marginBottom: '2rem',
        fontFamily: 'Creepster, system-ui, sans-serif'
      }}>
        Monster Name Generator
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={handleGenerate}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(to right, #059669, #047857)',
            color: 'white',
            fontSize: '1.125rem',
            borderRadius: '0.5rem',
            border: '2px solid #10b981',
            cursor: 'pointer'
          }}
        >
          Generate Monster
        </button>
      </div>

      {monster && (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '2rem',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '1rem',
          border: '2px solid #10b981',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem' }}>
            {monster.name}
          </h2>
          <p><strong>Type:</strong> {monster.type}</p>
          <p><strong>Power:</strong> {monster.power}/100</p>
          <p><strong>Weakness:</strong> {monster.weakness}</p>
          <p><strong>Origin:</strong> {monster.origin}</p>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a 
          href="/game/headquarters" 
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.5rem',
            border: '2px solid #8b5cf6'
          }}
        >
          Return to Game
        </a>
      </div>
    </div>
  );
}