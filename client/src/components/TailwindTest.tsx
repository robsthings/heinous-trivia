export default function TailwindTest() {
  return (
    <div className="min-h-screen p-8 space-y-6 bg-dark">
      {/* Horror Theme Color Test */}
      <h1 className="text-4xl text-blood" style={{ fontFamily: '"Creepster", cursive' }}>Tailwind V4 horror theme is working!</h1>
      
      {/* Font Test */}
      <div className="space-y-4 bg-void p-6 rounded">
        <h2 className="text-white text-xl mb-4">Font Tests:</h2>
        <div className="text-blood text-3xl" style={{ fontFamily: '"Creepster", cursive' }}>Creepster Font - Horror Title</div>
        <div className="text-crimson text-2xl" style={{ fontFamily: '"Nosifer", cursive' }}>Nosifer Font - Scary Text</div>
        <div className="text-flame text-xl" style={{ fontFamily: '"Eater", cursive' }}>Eater Font - Disturbing Words</div>
      </div>
      
      {/* Color Palette Test */}
      <div className="bg-shadow p-6 rounded">
        <h2 className="text-white text-xl mb-4">Color Palette:</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-blood text-white p-3 text-center rounded">Blood</div>
          <div className="bg-void text-white p-3 text-center rounded">Void</div>
          <div className="bg-correct text-white p-3 text-center rounded">Correct</div>
          <div className="bg-wrong text-white p-3 text-center rounded">Wrong</div>
          <div className="bg-shadow text-white p-3 text-center rounded">Shadow</div>
          <div className="bg-flame text-white p-3 text-center rounded">Flame</div>
          <div className="bg-ghost text-black p-3 text-center rounded">Ghost</div>
          <div className="bg-spirit text-black p-3 text-center rounded">Spirit</div>
          <div className="bg-poison text-black p-3 text-center rounded">Poison</div>
          <div className="bg-crimson text-white p-3 text-center rounded">Crimson</div>
        </div>
      </div>
      
      {/* Animation Test */}
      <div className="bg-blood text-white p-6 animate-pulse-glow rounded">
        <h2 className="text-2xl" style={{ fontFamily: '"Creepster", cursive' }}>Animation Test: Pulse Glow Effect</h2>
      </div>
      
      {/* Integration Test */}
      <div className="bg-void border-2 border-blood p-6 rounded">
        <h2 className="text-flame text-2xl mb-2" style={{ fontFamily: '"Nosifer", cursive' }}>Complete Integration Test</h2>
        <p className="text-ghost" style={{ fontFamily: '"Eater", cursive' }}>All fonts, colors, and animations working together!</p>
      </div>
    </div>
  );
}