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
    let baseClass = "horror-button w-full p-4 rounded-lg text-left font-medium text-white hover:scale-[1.02] transition-transform";
    
    if (gameState.showFeedback && gameState.selectedAnswer !== null) {
      if (index === currentQuestion.correctAnswer) {
        baseClass += " correct-answer";
      } else if (index === gameState.selectedAnswer) {
        baseClass += " wrong-answer";
      }
    }
    
    return baseClass;
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < difficulty ? 'bg-orange-500' : 'bg-gray-600'
        }`}
      />
    ));
  };

  return (
    <div className="glass-card rounded-xl p-6 mt-4 animate-fade-in">
      <div className="mb-6">
        <h2 className="font-creepster text-2xl text-white mb-4 leading-tight">
          {currentQuestion.text}
        </h2>
        
        <div className="flex items-center space-x-3 mb-4">
          <span className="bg-purple-900 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentQuestion.category}
          </span>
          <div className="flex space-x-1">
            {getDifficultyStars(currentQuestion.difficulty)}
          </div>
        </div>
      </div>

      <div className="space-y-3">
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
              <span className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center text-sm font-bold mr-4">
                {answerLabels[index]}
              </span>
              <span>{answer}</span>
            </div>
          </button>
        ))}
      </div>

      {gameState.showFeedback && (
        <div className={`mt-6 p-4 rounded-lg border animate-slide-up ${
          gameState.isCorrect 
            ? 'bg-green-900 border-green-600' 
            : 'bg-red-900 border-red-600'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              gameState.isCorrect ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <span className="text-white text-sm">
                {gameState.isCorrect ? '✓' : '✗'}
              </span>
            </div>
            <div>
              <p className="font-medium text-white">
                {gameState.isCorrect ? 'Correct!' : 'Incorrect!'}
              </p>
              <p className="text-gray-100 text-sm mt-1">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {gameState.showFeedback && (
        <div className="mt-6 flex justify-center">
          <button
            className="horror-button px-8 py-3 rounded-lg font-medium text-white hover:scale-105 transition-transform"
            onClick={onNextQuestion}
          >
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}
