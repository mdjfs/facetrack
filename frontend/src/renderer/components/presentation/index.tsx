import * as React from 'react';
import './presentation.css';

const camera = require.resolve('_public/images/camera.jpg');

interface PresentationProps {
  children: React.ReactNode;
}

function Presentation(props: PresentationProps): JSX.Element {
  const { children } = props;
  return (
    <div className="presentation-container">
      <img alt="Camera" src={camera} className="presentation-camera" />
      <div className="presentation-body">
        <div className="presentation-childrens">{children}</div>
      </div>
    </div>
  );
}

export default Presentation;
