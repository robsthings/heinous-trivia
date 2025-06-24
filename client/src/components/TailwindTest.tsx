export default function TailwindTest() {
  return (
    <div className="min-h-screen p-8 space-y-6">
      {/* Horror Theme Color Test */}
      <div className="bg-void text-correct font-creepster p-4 rounded">
        🔥 Tailwind V4 horror theme is working!
      </div>
      
      {/* Font Test */}
      <div className="space-y-2">
        <div className="font-creepster text-blood text-2xl">Creepster Font Test</div>
        <div className="font-nosifer text-wrong text-xl">Nosifer Font Test</div>
        <div className="font-eater text-ghost text-lg">Eater Font Test</div>
      </div>
      
      {/* Color Palette Test */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-blood text-white p-2 text-center">Blood</div>
        <div className="bg-void text-white p-2 text-center">Void</div>
        <div className="bg-correct text-white p-2 text-center">Correct</div>
        <div className="bg-wrong text-white p-2 text-center">Wrong</div>
        <div className="bg-shadow text-white p-2 text-center">Shadow</div>
        <div className="bg-flame text-white p-2 text-center">Flame</div>
        <div className="bg-poison text-black p-2 text-center">Poison</div>
        <div className="bg-crimson text-white p-2 text-center">Crimson</div>
      </div>
      
      {/* Animation Test */}
      <div className="bg-blood text-white p-4 animate-pulse-glow rounded">
        Animation Test: Pulse Glow
      </div>
    </div>
  );
}