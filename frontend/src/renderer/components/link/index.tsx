/* eslint-disable sort-imports */
import * as React from 'react';
import './link.css';

interface LinkProps{
  content: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

function Link({content, onClick = ()=>{} , className = ""}: LinkProps): JSX.Element {
  return (
    <button onClick={onClick} className={`app-link ${className}`}>{content}</button>
  );
}

export default Link;