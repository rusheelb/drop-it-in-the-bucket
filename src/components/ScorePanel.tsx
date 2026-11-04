import React from 'react';
import { Volume2, VolumeX, RotateCcw, Play, Target } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { GameState } from '../types';

interface ScorePanelProps {
  score: number;
  highScore: number;
  timeRemaining: number;
  winScoreGoal: number;
  gameState: GameState;
  isMuted: boolean;
  onStart: () => void;
  onReset: () => void;
  onToggleMute: () => void;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({
  score,
  highScore,
  timeRemaining,
  winScoreGoal,
  gameState,
  isMuted,
  onStart,
  onReset,
  onToggleMute,
}) => {
  const formatTime = (seconds: number) => {
    return `0:${String(Math.max(0, seconds)).padStart(2, '0')}`;
  };

  const getStartButtonText = () => {
    if (gameState === 'playing') return 'Playing...';
    if (gameState === 'gameover') return 'Play Again';
    return 'Start Game';
  };

  return (
    <section className="score-panel" aria-label="Game status">
      <div className="score-panel-stats">
        <div className="stat-item">
          <span className="stat-label">Points:</span>
          <strong className="stat-value highlight">{score}</strong>
        </div>
        <div className="stat-item" title={`Win Goal: ${winScoreGoal} points`}>
          <span className="stat-label">Goal:</span>
          <strong className="stat-value goal-value">
            <Target size={15} className="inline-icon" /> {winScoreGoal}
          </strong>
        </div>
        <div className="stat-item">
          <span className="stat-label">Best:</span>
          <strong className="stat-value">{highScore}</strong>
        </div>
        <div className="stat-item">
          <span className="stat-label">Timer:</span>
          <strong className="stat-value">{formatTime(timeRemaining)}</strong>
        </div>
      </div>

      <div className="score-panel-controls">
        <button
          type="button"
          className="icon-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onToggleMute();
          }}
          title={isMuted ? 'Unmute audio' : 'Mute audio'}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button
          type="button"
          className="game-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onStart();
          }}
          disabled={gameState === 'playing'}
        >
          <Play size={16} fill="currentColor" />
          {getStartButtonText()}
        </button>

        <button
          type="button"
          className="game-btn reset-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onReset();
          }}
          title="Reset game to start"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </section>
  );
};
