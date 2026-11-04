import React from 'react';
import { Award, Sparkles, X } from 'lucide-react';
import { Milestone } from '../types';

interface MilestoneBannerProps {
  milestone: Milestone | null;
  onDismiss: () => void;
}

export const MilestoneBanner: React.FC<MilestoneBannerProps> = ({ milestone, onDismiss }) => {
  if (!milestone) return null;

  return (
    <div
      className="milestone-banner"
      role="alert"
      aria-live="assertive"
      aria-label={`Milestone reached: ${milestone.title}`}
    >
      <div className="milestone-content">
        <div className="milestone-icon-wrap">
          <Award size={22} className="milestone-icon" />
          <Sparkles size={14} className="milestone-sparkle" />
        </div>

        <div className="milestone-text">
          <div className="milestone-title-row">
            <span className="milestone-score-tag">{milestone.score} PTS</span>
            <strong className="milestone-title">{milestone.title}</strong>
          </div>
          <p className="milestone-desc">{milestone.message}</p>
        </div>

        <button
          type="button"
          className="milestone-close"
          onClick={onDismiss}
          aria-label="Dismiss milestone alert"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
