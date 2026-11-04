import React from 'react';
import { Trophy, RefreshCw, Target } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  message: string;
  isWin: boolean;
  difficultyName: string;
  winScoreGoal: number;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  message,
  isWin,
  difficultyName,
  winScoreGoal,
  onPlayAgain,
}) => {
  return (
    <div className="game-over-modal" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
      <div className="game-over-card">
        <h2 id="game-over-title" className="game-over-title">
          {isWin ? '🎉 Goal Achieved!' : '⏰ Time’s Up!'}
        </h2>

        <div className="game-over-meta">
          <span className="game-over-mode-tag">{difficultyName} Mode</span>
          <span className="game-over-goal-tag">
            <Target size={14} /> Goal: {winScoreGoal} pts
          </span>
        </div>

        <div className="game-over-score-badge">
          Collected: <strong>{score} points</strong>
        </div>

        {score > 0 && score >= highScore && (
          <div style={{ color: '#0284c7', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Trophy size={18} color="#ffc907" />
            <span>New High Score!</span>
          </div>
        )}

        <p className="game-over-message">{message}</p>

        <div className="game-over-actions">
          <button
            type="button"
            className="game-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onPlayAgain();
            }}
          >
            <RefreshCw size={18} />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
