import * as React from 'react';
import './link.css';

interface LinkProps {
  content: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
}

function Link({
  content,
  onClick = undefined,
  className = '',
}: LinkProps): JSX.Element {
  return (
    <button onClick={onClick} type="button" className={`app-link ${className}`}>
      {content}
    </button>
  );
}

export default Link;
