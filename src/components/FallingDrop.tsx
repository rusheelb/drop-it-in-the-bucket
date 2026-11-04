import React from 'react';
import { Drop } from '../types';

interface FallingDropProps {
  drop: Drop;
  onClick: (drop: Drop, e: React.MouseEvent | React.PointerEvent) => void;
}

export const FallingDrop: React.FC<FallingDropProps> = ({ drop, onClick }) => {
  const className = drop.isBrown
    ? 'drop brown-drop'
    : drop.points === 3
    ? 'drop bonus-drop'
    : 'drop';

  const ariaLabel = drop.isBrown
    ? 'Brown contaminated drop - click to purify'
    : `Water drop worth ${drop.points} point${drop.points === 1 ? '' : 's'} - catch in bucket or tap`;

  const handleClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    onClick(drop, e);
  };

  return (
    <div
      className={className}
      aria-label={ariaLabel}
      style={{
        left: `${drop.x}px`,
        top: `${drop.y}px`,
        width: `${drop.size}px`,
        height: `${drop.size}px`,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
      onPointerDown={handleClick}
    />
  );
};
