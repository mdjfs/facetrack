import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '..';
import './confirm.css';

export interface ConfirmProps {
  message: string;
  cancelHandler: React.MouseEventHandler<
    SVGSVGElement | HTMLDivElement | HTMLButtonElement
  >;
  successHandler: React.MouseEventHandler<HTMLButtonElement>;
}

function Confirm({
  message,
  cancelHandler,
  successHandler,
}: ConfirmProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <Modal exitHandler={cancelHandler} className="confirm-modal">
      {message}
      <div className="confirm-actions">
        <Button
          theme="secondary"
          content={t('confirm.cancel')}
          onClick={cancelHandler}
          className="cancel-button"
        />
        <Button
          theme="primary"
          content={t('confirm.ok')}
          onClick={successHandler}
          className="success-button"
        />
      </div>
    </Modal>
  );
}

export default Confirm;
