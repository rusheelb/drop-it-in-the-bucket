import React from 'react';
import { ScorePopup } from '../types';

interface ScorePopupsProps {
  popups: ScorePopup[];
}

export const ScorePopups: React.FC<ScorePopupsProps> = ({ popups }) => {
  return (
    <div className="score-popups-container" aria-hidden="true">
      {popups.map((popup) => (
        <span
          key={popup.id}
          className={`score-popup score-popup-${popup.type}`}
          style={{
            left: `${popup.x}px`,
            top: `${popup.y}px`,
          }}
        >
          {popup.text}
        </span>
      ))}
    </div>
  );
};
