import { useParams, useLocation } from 'wouter';

export function Welcome() {
  const { hauntId } = useParams<{ hauntId: string }>();
  const [, setLocation] = useLocation();

  const handleStartGame = () => {
    if (hauntId) {
      // Mark as visited
      const visitKey = `visited_${hauntId}`;
      localStorage.setItem(visitKey, 'true');
      
      // Set session storage to track that user is coming from welcome
      sessionStorage.setItem('fromWelcome', 'true');
      
      setLocation(`/game/${hauntId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-void to-shadow flex items-center justify-center text-white relative overflow-hidden">
      {/* Laboratory Background Elements */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('/laboratory-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
        
        {/* Speech Bubble */}
        <div className="mb-2">
          <div className="bg-blood text-white rounded px-3 py-1 text-xs font-bold drop-shadow mb-2 inline-block relative">
            Back for more punishment?
            {/* Speech bubble pointer */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blood"></div>
          </div>
        </div>

        {/* Dr. Heinous Character */}
        <div className="mx-auto w-48 md:w-60 drop-shadow-xl mb-6">
          <img 
            src="/heinous/charming.png" 
            alt="Dr. Heinous" 
            className="w-full h-full object-contain"
            style={{ 
              imageRendering: 'pixelated'
            }}
          />
        </div>

        {/* Welcome Heading */}
        <h1 className="text-4xl md:text-5xl font-creepster text-orange-800 text-center drop-shadow mb-4">
          WELCOME BACK
        </h1>
        
        {/* Subtext */}
        <p className="text-lg text-ghost mt-4 mb-6 text-center">
          Ready for another spine-chilling round of trivia?
        </p>

        {/* Play Again Button */}
        <button
          onClick={handleStartGame}
          className="bg-blood hover:bg-crimson text-white font-bold px-6 py-3 rounded-md shadow-md transition hover:scale-105"
        >
          PLAY AGAIN
        </button>

        {/* Dynamic Haunt Footer */}
        <div className="text-sm text-orange-500 text-center underline mt-6">
          Haunt: {hauntId}
        </div>
      </div>
    </div>
  );
}

