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
    return (
      <div className="glass-card rounded-xl p-6 mt-4 animate-fade-in">
        <div className="text-center text-gray-300">
          <p>Question unavailable - Please try refreshing the game</p>
        </div>
      </div>
    );
  }

  const answerLabels = ['A', 'B', 'C', 'D'];

  const getButtonClass = (index: number) => {
    let baseClass = "w-full p-3 sm:p-4 rounded-lg text-left font-medium text-white hover:scale-[1.02] transition-all duration-200 border-2 touch-manipulation";
    
    if (gameState.showFeedback && gameState.selectedAnswer !== null) {
      if (index === currentQuestion.correctAnswer) {
        baseClass += " border-green-500 bg-green-600/20";
      } else if (index === gameState.selectedAnswer) {
        baseClass += " border-red-500 bg-red-600/20";
      } else {
        baseClass += ` border-gray-600 bg-gray-800/30`;
      }
    } else {
      baseClass += ` border-gray-600 bg-gray-800/30 haunt-themed-button`;
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
    <div className="glass-card rounded-xl p-4 sm:p-6 mt-4 animate-fade-in relative">
      {/* Haunt Logo Watermark */}
      {gameState.hauntConfig?.logoPath && (
        <div className="absolute bottom-4 right-4 opacity-20 w-12 h-12 z-10 pointer-events-none">
          <img 
            src={gameState.hauntConfig.logoPath} 
            alt="Haunt Logo"
            className="w-full h-full object-contain filter grayscale"
          />
        </div>
      )}
      
      <div className="mb-4 sm:mb-6">
        <h2 className="font-creepster text-lg sm:text-xl md:text-2xl text-white mb-3 sm:mb-4 leading-tight">
          {currentQuestion.text}
        </h2>
        
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
          <span 
            className="text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
            style={{ backgroundColor: secondaryColor }}
          >
            {currentQuestion.category}
          </span>
          <div className="flex space-x-1">
            {getDifficultyStars(currentQuestion.difficulty)}
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {currentQuestion.answers?.map((answer, index) => (
          <button
            key={index}
            className={getButtonClass(index)}
            onClick={() => {
              // Answer bounds check
              if (index < 0 || index >= currentQuestion.answers?.length) {
                console.warn("Invalid answer selected");
                return;
              }
              onSelectAnswer(index);
            }}
            disabled={gameState.selectedAnswer !== null}
          >
            <div className="flex items-center">
              <span 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3 sm:mr-4 text-white flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {answerLabels[index]}
              </span>
              <span className="text-sm sm:text-base text-left break-words">{answer}</span>
            </div>
          </button>
        ))}
      </div>

      {gameState.showFeedback && (
        <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border animate-slide-up ${
          gameState.isCorrect 
            ? 'bg-green-900 border-green-600' 
            : 'bg-red-900 border-red-600'
        }`}>
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              gameState.isCorrect ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <span className="text-white text-xs sm:text-sm">
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
