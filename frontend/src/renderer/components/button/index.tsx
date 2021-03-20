/* eslint-disable sort-imports */
import * as React from 'react';
import './button.css';

interface ButtonProps{
  content: string;
  theme: 'primary' | 'secondary';
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

function Button({content, theme, onClick, className = ""}: ButtonProps): JSX.Element {
  return (
    <div className={`button-wrapper ${theme + ` ${className}`}`}>
      <button
        className={theme}
        type="button"
        onClick={onClick}
      >
        <div className="test">{content}</div>
      </button>
    </div>
  );
}

export default Button;
