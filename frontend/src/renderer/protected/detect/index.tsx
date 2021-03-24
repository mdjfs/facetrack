/* eslint-disable sort-imports */

import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./detect.css";
import { Button, Card, ErrorBox } from "_/renderer/components";
import {
  faChevronLeft,
  faPlusSquare,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { startProbe, OnvifDevice, Probe } from "node-onvif-ts";
import { useHistory } from "react-router";
import { DeviceT, Device } from "_/renderer/controllers/device";

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
    const devicesFound = await deviceController.scan();
    setDevices(devicesFound);
    if (devicesFound.length == 0) setError(new Error(t("error.NO_DEVICES")));
    setLoading(false);
  }

  useEffect(() => {
    const devicesFound = deviceController.getDevices();
    console.log(devicesFound);
    setDevices(devicesFound);
  }, []);

  return (
    <React.Fragment>
      <FontAwesomeIcon
        icon={faChevronLeft}
        className="go-back"
        onClick={() => history.push("/dashboard")}
      ></FontAwesomeIcon>
      <div className="detect-header">
        <h1>{t("detect.header")}</h1>
      </div>
      <div className="detect-body">
        {isLoading && <FontAwesomeIcon icon={faSpinner} spin></FontAwesomeIcon>}
        {!isLoading && (
          <React.Fragment>
            {error && (
              <ErrorBox
                error={t("error.NO_DEVICES")}
                complete={error}
                exitHandler={() => setError(null)}
              />
            )}
            {devices.length > 0 && (
              <React.Fragment>
                {devices.map((device, index) => (
                  <Card key={`${device.probe.name}-${index}`} size="large">
                    <ul className="device-info">
                      {device.probe.name && (
                        <li>
                          <strong>{t("detect.device.name")}: </strong>
                          {unescape(device.probe.name)}
                        </li>
                      )}
                      {device.probe.hardware && (
                        <li>
                          <strong>{t("detect.device.hardware")}: </strong>
                          {unescape(device.probe.hardware)}
                        </li>
                      )}
                      {device.probe.location && (
                        <li>
                          <strong>{t("detect.device.location")}: </strong>
                          {unescape(device.probe.location)}
                        </li>
                      )}
                      <Button
                        onClick={() =>
                          history.push(
                            `/new-device/${escape(device.probe.urn)}`
                          )
                        }
                        theme="primary"
                        content={t("detect.buttons.register")}
                        className="device-button-right"
                      />
                    </ul>
                  </Card>
                ))}

                <Button
                  content={t("detect.buttons.refresh")}
                  theme="primary"
                  onClick={() => scan()}
                />
              </React.Fragment>
            )}

            {devices.length == 0 && (
              <Button
                content={t("detect.buttons.detect")}
                theme="primary"
                onClick={() => scan()}
              />
            )}
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

export default Detect;
