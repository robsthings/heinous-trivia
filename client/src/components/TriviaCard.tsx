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
  const [isDeSpookified, setIsDeSpookified] = useState(false);

  // Check for DeSpookify mode on mount and when localStorage changes
  useEffect(() => {
    const checkDeSpookify = () => {
      const saved = localStorage.getItem('heinous-despookify-mode');
      setIsDeSpookified(saved === 'true');
    };

    checkDeSpookify();
    
    // Listen for changes to despookify mode
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'heinous-despookify-mode') {
        checkDeSpookify();
      }
    };

    // Listen for custom events when toggle is clicked
    const handleDeSpookifyToggle = () => {
      checkDeSpookify();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('despookify-toggle', handleDeSpookifyToggle);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('despookify-toggle', handleDeSpookifyToggle);
    };
  }, []);
  
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
    <div style={{
      background: 'rgba(31, 41, 55, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(75, 85, 99, 0.6)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '16px',
      position: 'relative'
    }}>
      {/* Question Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#ffffff', 
          fontSize: '20px', 
          fontWeight: '500', 
          lineHeight: '1.6', 
          marginBottom: '16px',
          fontFamily: isDeSpookified ? 'Arial, sans-serif' : '"Creepster", cursive',
          textTransform: isDeSpookified ? 'none' : 'uppercase',
          letterSpacing: isDeSpookified ? 'normal' : '1px'
        }}>
          {currentQuestion.text}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {currentQuestion.category}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {getDifficultyStars(currentQuestion.difficulty)}
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {currentQuestion.answers?.map((answer, index) => {
          let buttonStyle = {
            width: '100%',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'left' as const,
            fontWeight: '500',
            transition: 'all 0.2s ease',
            cursor: gameState.selectedAnswer !== null ? 'default' : 'pointer',
            background: 'rgba(55, 65, 81, 0.8)',
            border: '1px solid rgba(75, 85, 99, 0.6)',
            color: '#ffffff',
            transform: 'translateY(0)'
          };

          if (gameState.showFeedback && gameState.selectedAnswer !== null) {
            if (index === currentQuestion.correctAnswer) {
              buttonStyle = {
                ...buttonStyle,
                background: '#15803d',
                border: '1px solid #16a34a',
                color: '#ffffff'
              };
            } else if (index === gameState.selectedAnswer) {
              buttonStyle = {
                ...buttonStyle,
                background: '#991b1b',
                border: '1px solid #dc2626',
                color: '#ffffff'
              };
            } else {
              buttonStyle = {
                ...buttonStyle,
                background: 'rgba(55, 65, 81, 0.4)',
                color: '#9ca3af',
                border: '1px solid rgba(75, 85, 99, 0.4)'
              };
            }
          }

          return (
            <button
              key={index}
              style={buttonStyle}
              onClick={() => {
                if (index < 0 || index >= currentQuestion.answers?.length) {
                  return;
                }
                onSelectAnswer(index);
              }}
              disabled={gameState.selectedAnswer !== null}
              onMouseEnter={(e) => {
                if (gameState.selectedAnswer === null) {
                  e.currentTarget.style.background = 'rgba(75, 85, 99, 0.8)';
                }
              }}
              onMouseLeave={(e) => {
                if (gameState.selectedAnswer === null) {
                  e.currentTarget.style.background = 'rgba(55, 65, 81, 0.8)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  flexShrink: 0
                }}>
                  {answerLabels[index]}
                </span>
                <span style={{ fontSize: '16px', textAlign: 'left', wordBreak: 'break-words' }}>
                  {answer}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {gameState.showFeedback && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: '8px',
          background: gameState.isCorrect ? '#15803d' : '#991b1b',
          border: gameState.isCorrect ? '1px solid #16a34a' : '1px solid #dc2626'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: gameState.isCorrect ? '#16a34a' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {gameState.isCorrect ? '✓' : '✗'}
              </span>
            </div>
            <div>
              <p style={{ 
                fontWeight: '500', 
                color: '#ffffff', 
                fontSize: '16px', 
                marginBottom: '4px',
                fontFamily: '"Creepster", cursive'
              }}>
                {gameState.isCorrect ? 'Correct!' : 'Incorrect!'}
              </p>
              <p style={{ 
                color: '#f3f4f6', 
                fontSize: '14px',
                fontFamily: '"Nosifer", cursive'
              }}>
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {gameState.showFeedback && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
          <button
            style={{
              padding: '12px 24px',
              background: '#991b1b',
              color: '#ffffff',
              borderRadius: '8px',
              fontWeight: '500',
              border: '1px solid #dc2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '16px',
              fontFamily: '"Creepster", cursive',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onClick={onNextQuestion}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#991b1b';
            }}
          >
            {gameState.questionsAnswered >= 20 ? 'View Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
