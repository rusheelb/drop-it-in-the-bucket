import React from 'react';
import { JerryCanItem } from '../types';

interface JerryCanTargetProps {
  item: JerryCanItem;
  onCollect: (item: JerryCanItem, e: React.MouseEvent | React.PointerEvent) => void;
}

export const JerryCanTarget: React.FC<JerryCanTargetProps> = ({ item, onCollect }) => {
  const handleClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    onCollect(item, e);
  };

  return (
    <div
      className="floating-jerry-can"
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
      }}
      onPointerDown={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Bonus Yellow Jerry Can! Tap to collect +5 points"
      title="Tap to collect +5 bonus water points!"
    >
      <img
        src="/img/water-can-transparent.png"
        alt="charity: water yellow jerry can"
        className="jerry-can-img"
        draggable={false}
      />
      <div className="jerry-can-badge">+5</div>
    </div>
  );
};
