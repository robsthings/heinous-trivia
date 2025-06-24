import { useState, useEffect } from "react";
import type { GameState } from "@/lib/gameState";
import type { TriviaQuestion } from "@shared/schema";

interface TriviaCardProps {
  gameState: GameState;
  onSelectAnswer: (answerIndex: number) => void;
  onNextQuestion: () => void;
}

export function TriviaCard({ gameState, onSelectAnswer, onNextQuestion }: TriviaCardProps) {
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  
  // Get theme colors from haunt config
  const primaryColor = gameState.hauntConfig?.theme?.primaryColor || '#8B0000';
  const secondaryColor = gameState.hauntConfig?.theme?.secondaryColor || '#2D1B69';
  const accentColor = gameState.hauntConfig?.theme?.accentColor || '#FF6B35';
  
  // Apply custom CSS properties for theme colors
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--haunt-primary', primaryColor);
    root.style.setProperty('--haunt-secondary', secondaryColor);
    root.style.setProperty('--haunt-accent', accentColor);
  }, [primaryColor, secondaryColor, accentColor]);
  
  // Enhanced null checks to prevent crashes
  if (!currentQuestion || !currentQuestion.answers || !Array.isArray(currentQuestion.answers)) {
    console.error(`🚨 CRITICAL: Question unavailable at index ${gameState.currentQuestionIndex}`);
    console.error(`🚨 Total questions loaded: ${gameState.questions.length}`);
    console.error(`🚨 Questions answered so far: ${gameState.questionsAnswered}`);
    console.error(`🚨 Current question data:`, currentQuestion);
    
    // Trigger game end instead of showing error message
    setTimeout(() => {
      onNextQuestion(); // This will trigger the game end logic
    }, 1000);
    
    return (
      <div className="glass-card rounded-xl p-6 mt-4 animate-fade-in">
        <div className="text-center text-gray-300">
          <p>Loading next question...</p>
        </div>
      </div>
    );
  }

  const answerLabels = ['A', 'B', 'C', 'D'];

  const getButtonClass = (index: number) => {
    let baseClass = "w-full p-4 rounded-lg text-left font-medium transition-all duration-200 touch-manipulation";
    
    if (gameState.showFeedback && gameState.selectedAnswer !== null) {
      if (index === currentQuestion.correctAnswer) {
        baseClass += " bg-green-600 text-white shadow-lg";
      } else if (index === gameState.selectedAnswer) {
        baseClass += " bg-red-600/70 text-white shadow-lg";
      } else {
        baseClass += " bg-gradient-to-r from-red-700 to-purple-700 text-gray-300 opacity-50";
      }
    } else {
      baseClass += " bg-gradient-to-r from-red-700 to-purple-700 text-white hover:from-red-600 hover:to-purple-600 shadow-lg";
    }
    
    return baseClass;
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className="w-2 h-2 rounded-full"
        style={{ 
          backgroundColor: i < difficulty ? accentColor : '#4B5563' 
        }}
      />
    ));
  };

  return (
    <div className="w-full">
      {/* Question Header */}
      <div className="text-center mb-8 px-4">
        <h2 className="text-white text-xl font-medium leading-relaxed mb-4">
          {currentQuestion.text}
        </h2>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentQuestion.category}
          </span>
          <div className="flex space-x-1">
            {getDifficultyStars(currentQuestion.difficulty)}
          </div>
        </div>
      </div>

      {/* Answer Options - Full Width */}
      <div className="space-y-3 px-4">
        {currentQuestion.answers?.map((answer, index) => (
          <button
            key={index}
            className={`w-full p-4 rounded-lg bg-gradient-to-r from-blood to-crimson text-white border border-crimson/30 transition-all duration-300 hover:scale-105 animate-pulse-glow ${getButtonClass(index)}`}
            onClick={() => {
              // Answer bounds check
              if (index < 0 || index >= currentQuestion.answers?.length) {
                return;
              }
              onSelectAnswer(index);
            }}
            disabled={gameState.selectedAnswer !== null}
          >
            <div className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                {answerLabels[index]}
              </span>
              <span className="text-base text-left break-words">{answer}</span>
            </div>
          </button>
        ))}
      </div>

      {gameState.showFeedback && (
        <div className={`mt-6 p-4 rounded-lg border animate-slide-up ${
          gameState.isCorrect 
            ? 'bg-green-600 border-green-500' 
            : 'bg-red-600/90 border-red-500'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              gameState.isCorrect ? 'bg-white text-green-600' : 'bg-white text-red-600'
            }`}>
              <span className="text-sm font-bold">
                {gameState.isCorrect ? '✓' : '✗'}
              </span>
            </div>
            <div>
              <p className="font-medium text-white text-sm sm:text-base">
                {gameState.isCorrect ? 'Correct!' : 'Incorrect!'}
              </p>
              <p className="text-gray-100 text-xs sm:text-sm mt-1">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {gameState.showFeedback && (
        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            className="horror-button px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-white hover:scale-105 transition-transform text-sm sm:text-base touch-manipulation"
            onClick={onNextQuestion}
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}
