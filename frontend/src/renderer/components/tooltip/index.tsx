import * as React from 'react';
import './tooltip.css';

interface TooltipProps {
  children: React.ReactNode;
  message: string;
  className?: string;
}

const { useState } = React;

function Tooltip({
  children,
  message,
  className = '',
}: TooltipProps): JSX.Element {
  const [isOpen, setOpen] = useState(false);

  return (
    <div
      className={`app-tooltip ${className}`}
      onClick={() => setOpen(!isOpen)}>
      {children}
      {isOpen && <div className="app-tooltip-message">{message}</div>}
    </div>
  );
}

export default Tooltip;
