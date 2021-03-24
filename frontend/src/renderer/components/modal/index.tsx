/* eslint-disable sort-imports */
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import "./modal.css";

interface ModalProps {
  children: React.ReactNode;
  exitHandler: React.MouseEventHandler<HTMLElement>;
}

function Modal({ children, exitHandler }: ModalProps): JSX.Element {
  return (
    <div className="app-modal-background">
      <div className="app-modal">
        <FontAwesomeIcon
          className="app-modal-exit"
          icon={faTimes}
          onClick={exitHandler}
        />
        {children}
      </div>
    </div>
  );
}

export default Modal;
