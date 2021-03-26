import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import './modal.css';

interface ModalProps {
  children: React.ReactNode;
  exitHandler: React.MouseEventHandler<SVGSVGElement | HTMLDivElement>;
}

function Modal({ children, exitHandler }: ModalProps): JSX.Element {
  return (
    <>
      <div className="app-modal-background" onClick={exitHandler} />
      <div className="app-modal">
        <FontAwesomeIcon
          className="app-modal-exit"
          icon={faTimes}
          onClick={exitHandler}
        />
        {children}
      </div>
    </>
  );
}

export default Modal;
