/* eslint-disable sort-imports */
import * as React from "react";
import "./card.css";

interface CardProps {
  children: React.ReactNode;
  size?: "large" | "medium" | "short";
}

function Card({ children, size = "short" }: CardProps): JSX.Element {
  return (
    <div className="app-card-wrapper">
      <div className={`app-card ${size}`}>{children}</div>
    </div>
  );
}

export default Card;
