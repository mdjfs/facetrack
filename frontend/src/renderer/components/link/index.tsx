/* eslint-disable sort-imports */
import * as React from 'react';
import './link.css';

interface ButtonProps{
  content: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}

function Link({content, href = "#" , onClick = ()=>{} , className = ""}: ButtonProps): JSX.Element {
  return (
    <a href={href} onClick={onClick} className={`app-link ${className}`}>{content}</a>
  );
}

export default Link;