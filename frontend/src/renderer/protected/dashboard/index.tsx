/* eslint-disable sort-imports */

import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./dashboard.css";
import { Card, ErrorBox, Modal, Stream } from "_/renderer/components";
import { faPlusSquare, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import Camera from "_/renderer/controllers/camera";

const cameraController = new Camera();

const { useState, useEffect } = React;

function Dashboard(): JSX.Element {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [focusedCamera, setFocusedCamera] = useState<Camera | null>(null);

  async function loadCameras() {
    setLoading(true);
    const [err, loadedCameras] = await cameraController.getAll();
    if (err) setError(err);
    else if (loadedCameras) {
      for (const camera of loadedCameras) {
        const device = camera.getDevice();
        await device?.device.init();
      }
      setCameras(loadedCameras);
      const device = loadedCameras[0].getDevice();
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCameras();
  }, []);

  const { t } = useTranslation();
  const history = useHistory();
  return (
    <React.Fragment>
      <div className="dash-header">
        <h1>{t("dashboard.header")}</h1>
      </div>
      {error && (
        <ErrorBox
          error={t("error.FAILED_LOADING_CAMERAS")}
          complete={error}
          exitHandler={() => setError(null)}
        />
      )}
      {focusedCamera && (
        <Modal exitHandler={() => setFocusedCamera(null)}>
          <div className="stream-modal">
            <Stream camera={focusedCamera} latency={100} />
            <h1>{focusedCamera.name}</h1>
          </div>
        </Modal>
      )}
      {!focusedCamera && (
        <div className="dash-cards">
          {isLoading && (
            <FontAwesomeIcon icon={faSpinner} spin></FontAwesomeIcon>
          )}
          {!isLoading &&
            cameras.length > 0 &&
            cameras.map((camera, index) => (
              <Card key={`camera-${index}`}>
                <div
                  className="camera-container"
                  onClick={() => setFocusedCamera(camera)}
                >
                  <Stream camera={camera} />
                  <div className="camera-name">{camera.name}</div>
                </div>
              </Card>
            ))}
          <Card>
            <FontAwesomeIcon
              className="app-card-add"
              icon={faPlusSquare}
              onClick={() => history.push("/detect")}
            />
          </Card>
        </div>
      )}
    </React.Fragment>
  );
}

export default Dashboard;
