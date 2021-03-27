import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import './noticebox.css';

interface NoticeBoxProps {
  message: string;
  exitHandler: React.MouseEventHandler<SVGSVGElement>;
  className?: string;
}

function NoticeBox({
  message,
  exitHandler,
  className = '',
}: NoticeBoxProps): JSX.Element {
  return (
    <div className={`notice-box ${className}`}>
      <FontAwesomeIcon
        className="notice-box-exit"
        icon={faTimes}
        onClick={exitHandler}
      />
      {message}
    </div>
  );
}

export default NoticeBox;
