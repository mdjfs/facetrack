import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, ErrorBox, Modal, Stream } from '_/renderer/components';
import { faPlusSquare, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import Camera from '_/renderer/controllers/camera';
import './dashboard.css';

const cameraController = new Camera();

const { useState, useEffect } = React;

function Dashboard(): JSX.Element {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [focusedCamera, setFocusedCamera] = useState<Camera | null>(null);

  const { t } = useTranslation();
  const history = useHistory();

  async function loadCameras() {
    setLoading(true);
    try {
      const [err, loadedCameras] = await cameraController.getAll();
      if (err) throw err;
      else if (loadedCameras) {
        setCameras(loadedCameras);
      }
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadCameras();
  }, []);

  return (
    <>
      <div className="dash-header">
        <h1>{t('dashboard.header')}</h1>
      </div>
      {error && (
        <ErrorBox
          error={t('error.FAILED_LOADING_CAMERAS')}
          complete={error}
          exitHandler={() => setError(null)}
          className="error-loading-cameras"
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
          {isLoading && <FontAwesomeIcon icon={faSpinner} spin />}
          {!isLoading &&
            cameras.length > 0 &&
            cameras.map((camera) => (
              <Card
                key={`camera-${camera.id}`}
                className="camera-container"
                onClick={() => {
                  if (camera.isInitialized()) setFocusedCamera(camera);
                }}>
                <Stream camera={camera} />
                <div className="camera-name">{camera.name}</div>
              </Card>
            ))}
          <Card>
            <FontAwesomeIcon
              className="app-card-add"
              icon={faPlusSquare}
              onClick={() => history.push('/detect')}
            />
          </Card>
        </div>
      )}
    </>
  );
}

export default Dashboard;
