import type { LeaderboardEntry } from "@shared/schema";

interface LeaderboardProps {
  isVisible: boolean;
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
}

export function Leaderboard({ isVisible, leaderboard, onClose }: LeaderboardProps) {
  if (!isVisible) {
    return null;
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-red-900";
      case 1:
        return "bg-purple-900";
      case 2:
        return "bg-purple-900";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-xl p-6 max-w-md w-full animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="font-creepster text-3xl text-orange-500 mb-2">Hall of Horror</h2>
          <p className="text-gray-300">Top 10 Nightmare Navigators</p>
        </div>

        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {leaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No scores recorded yet.</p>
              <p className="text-sm mt-2">Be the first to join the Hall of Horror!</p>
            </div>
          ) : (
            leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={`${entry.name}-${entry.date}`}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-purple-900"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(index)}`}>
                    <span>{index + 1}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-white block">{entry.name}</span>
                    <span className="text-xs text-gray-400">
                      {entry.correctAnswers}/{entry.questionsAnswered} correct
                    </span>
                  </div>
                </div>
                <div className="text-orange-500 font-bold">{entry.score}</div>
              </div>
            ))
          )}
        </div>

        <div className="text-center">
          <button
            className="horror-button px-8 py-3 rounded-lg font-medium text-white"
            onClick={onClose}
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
