import React from 'react';
import { Difficulty, DifficultyConfig } from '../types';
import { soundManager } from '../utils/audio';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  configs: Record<Difficulty, DifficultyConfig>;
  disabled: boolean;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  configs,
  disabled,
  onSelectDifficulty,
}) => {
  return (
    <div className="difficulty-container" role="region" aria-label="Game Difficulty Settings">
      <div className="difficulty-header">
        <span className="difficulty-label">Difficulty Mode:</span>
        <span className="difficulty-hint">
          {disabled ? '(Changes apply when next game starts)' : 'Select before starting'}
        </span>
      </div>

      <div className="difficulty-tabs">
        {(Object.keys(configs) as Difficulty[]).map((level) => {
          const cfg = configs[level];
          const isSelected = currentDifficulty === level;

          return (
            <button
              key={level}
              type="button"
              className={`difficulty-tab ${isSelected ? 'active' : ''} ${level}`}
              onClick={() => {
                soundManager.playButtonClick();
                onSelectDifficulty(level);
              }}
              disabled={disabled}
              title={`${cfg.name}: ${cfg.time}s timer, goal ${cfg.winScore} pts`}
            >
              <div className="difficulty-tab-top">
                <span className="difficulty-name">{cfg.name}</span>
                <span className="difficulty-badge">{cfg.badge}</span>
              </div>
              <div className="difficulty-specs">
                <span>⏱️ {cfg.time}s</span>
                <span>🎯 {cfg.winScore} pts</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
