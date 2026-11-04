import React from 'react';
import { SplashEffect } from '../types';

interface SplashesProps {
  splashes: SplashEffect[];
}

export const Splashes: React.FC<SplashesProps> = ({ splashes }) => {
  return (
    <div className="splashes-container" aria-hidden="true">
      {splashes.map((s) => (
        <div
          key={s.id}
          className={`splash-effect splash-${s.type}`}
          style={{ left: `${s.x}px`, top: `${s.y}px` }}
        >
          <span className="splash-ring" />
          <span className="splash-particle p1" />
          <span className="splash-particle p2" />
          <span className="splash-particle p3" />
          <span className="splash-particle p4" />
        </div>
      ))}
    </div>
  );
};
