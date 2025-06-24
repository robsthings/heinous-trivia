export default function FontDebugTest() {
  return (
    <div className="min-h-screen p-8 space-y-6 bg-gray-900 text-white">
      <h1 className="text-3xl mb-6">Font Loading Debug Test</h1>
      
      {/* Direct CSS Font Test */}
      <div className="space-y-4 p-4 border border-gray-600 rounded">
        <h2 className="text-xl text-yellow-400">Direct CSS Font Tests:</h2>
        <div style={{ fontFamily: '"Creepster", cursive' }} className="text-2xl text-red-500">
          Creepster Direct CSS: HORROR FONT TEST
        </div>
        <div style={{ fontFamily: '"Nosifer", cursive' }} className="text-xl text-purple-500">
          Nosifer Direct CSS: SCARY TEXT
        </div>
        <div style={{ fontFamily: '"Eater", cursive' }} className="text-lg text-green-500">
          Eater Direct CSS: DISTURBING WORDS
        </div>
      </div>

      {/* Tailwind Font Class Test */}
      <div className="space-y-4 p-4 border border-gray-600 rounded">
        <h2 className="text-xl text-yellow-400">Tailwind Font Class Tests:</h2>
        <div className="font-creepster text-2xl text-red-500">
          Creepster Tailwind Class: HORROR FONT TEST
        </div>
        <div className="font-nosifer text-xl text-purple-500">
          Nosifer Tailwind Class: SCARY TEXT
        </div>
        <div className="font-eater text-lg text-green-500">
          Eater Tailwind Class: DISTURBING WORDS
        </div>
      </div>

      {/* Font Family CSS Variables Check */}
      <div className="space-y-4 p-4 border border-gray-600 rounded">
        <h2 className="text-xl text-yellow-400">Font Availability Check:</h2>
        <div className="text-sm font-mono">
          <div>document.fonts.ready status will show in console</div>
          <div>Check browser DevTools > Network > Fonts for loading status</div>
        </div>
      </div>

      {/* JavaScript Font Check */}
      <div className="text-sm text-gray-400">
        Font loading status will appear in browser console
      </div>
    </div>
  );
}