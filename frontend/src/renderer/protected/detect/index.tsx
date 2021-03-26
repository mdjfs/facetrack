import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './detect.css';
import { Button, Card, ErrorBox } from '_/renderer/components';
import {
  faChevronLeft,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { DeviceT, Device } from '_/renderer/controllers/device';

const { useState, useEffect } = React;
const deviceController = new Device();

function Detect(): JSX.Element {
  const { t } = useTranslation();

  const [devices, setDevices] = useState<DeviceT[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);

  const history = useHistory();

  async function scan() {
    setLoading(true);
    await deviceController.refresh();
    const devicesFound = await deviceController.scan();
    setDevices(devicesFound);
    if (devicesFound.length === 0) setError(new Error(t('error.NO_DEVICES')));
    setLoading(false);
  }

  useEffect(() => {
    const devicesFound = deviceController.getDevices();
    setDevices(devicesFound);
  }, []);

  return (
    <>
      <FontAwesomeIcon
        icon={faChevronLeft}
        className="go-back"
        onClick={() => history.push('/dashboard')}
      />
      <div className="detect-header">
        <h1>{t('detect.header')}</h1>
      </div>
      <div className="detect-body">
        {isLoading && (
          <FontAwesomeIcon
            className="detect-loading"
            icon={faCircleNotch}
            spin
          />
        )}
        {!isLoading && (
          <>
            {error && (
              <ErrorBox
                error={t('error.NO_DEVICES')}
                complete={error}
                exitHandler={() => setError(null)}
              />
            )}
            {devices.length > 0 && (
              <>
                {devices.map((device) => (
                  <Card key={`device-card-${device.probe.urn}`} size="large">
                    <ul className="device-info">
                      {device.probe.name && (
                        <li>
                          <strong>{t('detect.device.name')}: </strong>
                          {unescape(device.probe.name)}
                        </li>
                      )}
                      {device.probe.hardware && (
                        <li>
                          <strong>{t('detect.device.hardware')}: </strong>
                          {unescape(device.probe.hardware)}
                        </li>
                      )}
                      {device.probe.location && (
                        <li>
                          <strong>{t('detect.device.location')}: </strong>
                          {unescape(device.probe.location)}
                        </li>
                      )}
                      {device.device.address && (
                        <li>
                          <strong>{t('detect.device.address')}: </strong>
                          {unescape(device.device.address)}
                        </li>
                      )}
                      <Button
                        onClick={() => {
                          history.push(
                            `/new-device/${escape(device.probe.urn)}`,
                          );
                        }}
                        theme="primary"
                        content={t('detect.buttons.register')}
                        className="device-button-right"
                      />
                    </ul>
                  </Card>
                ))}

                <Button
                  content={t('detect.buttons.refresh')}
                  theme="primary"
                  onClick={() => scan()}
                />
              </>
            )}

            {devices.length === 0 && (
              <Button
                content={t('detect.buttons.detect')}
                theme="primary"
                onClick={() => scan()}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Detect;
