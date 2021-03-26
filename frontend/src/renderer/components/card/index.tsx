import * as React from 'react';
import './card.css';

interface CardProps {
  children: React.ReactNode;
  size?: 'large' | 'medium' | 'short';
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
}

function Card({
  children,
  size = 'short',
  onClick = undefined,
  className = '',
}: CardProps): JSX.Element {
  return (
    <div
      className={`app-card-wrapper ${className}`}
      role="button"
      tabIndex={0}
      onClick={onClick}>
      <div className={`app-card ${size}`}>{children}</div>
    </div>
  );
}

export default Card;
