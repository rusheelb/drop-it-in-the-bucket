import React from 'react';

interface BucketProps {
  x: number;
  isStunned: boolean;
  bucketRef: React.RefObject<HTMLDivElement>;
}

export const Bucket: React.FC<BucketProps> = ({ x, isStunned, bucketRef }) => {
  return (
    <div
      ref={bucketRef}
      className={`bucket ${isStunned ? 'stunned' : ''}`}
      style={{ left: `${x}px` }}
      aria-label="Water bucket"
    >
      <div className="bucket-brand">
        <img src="./img/cw_logo.png" alt="" />
        <span>charity: water</span>
      </div>
    </div>
  );
};
