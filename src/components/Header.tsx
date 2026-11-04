import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="game-header">
      <div className="brand-badge">
        <img src="/img/cw_logo.png" alt="charity: water logo" />
        <span>charity: water</span>
      </div>
      <h1>Drop It in the Bucket</h1>
      <p>Move the bucket to catch clean water for communities around the world.</p>

      <div className="game-instructions">
        <strong>
          <span>💡 How to play</span>
        </strong>
        <span>
          Move the bucket with your mouse, finger, or arrow keys—or <strong>tap drops directly</strong> in mid-air! Catch blue drops for <strong>+1</strong> or <strong>+3</strong> points, tap brown drops to <strong>purify</strong> them (+2 pts), collect floating <strong>Jerry Cans (+5 pts)</strong>, and try different difficulty modes!
        </span>
      </div>
    </header>
  );
};
