/* eslint-disable sort-imports */
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useTranslation } from "react-i18next";
import "./errorbox.css";

interface ErrorBoxProps {
  error: string;
  complete?: Error | null;
  exitHandler: React.MouseEventHandler<HTMLElement>;
}

const { useState } = React;

function ErrorBox({
  error,
  complete = null,
  exitHandler,
}: ErrorBoxProps): JSX.Element {
  const [details, setDetails] = useState(false);
  const { t } = useTranslation();
  return (
    <div className="error-box">
      <FontAwesomeIcon
        className="error-box-exit"
        icon={faTimes}
        onClick={exitHandler}
      />
      {error}
      {complete && (
        <React.Fragment>
          {details && (
            <div className="error-box-details">
              <FontAwesomeIcon
                className="error-box-exit"
                icon={faTimes}
                onClick={() => setDetails(false)}
              />
              {complete.message}
            </div>
          )}
          {!details && (
            <button
              className="error-box-show-details"
              onClick={() => setDetails(true)}
            >
              {t("error.SHOW_DETAILS_MSG")}
            </button>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

export default ErrorBox;
