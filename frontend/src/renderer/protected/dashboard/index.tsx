import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card,
  ErrorBox,
  Modal,
  Stream,
  Confirm,
  ConfirmProps,
  Nav,
} from '_/renderer/components';
import {
  faPlusSquare,
  faSpinner,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import Camera from '_/renderer/controllers/camera';
import './dashboard.css';

const cameraController = new Camera();

const { useState, useEffect } = React;

function Dashboard(): JSX.Element {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setLoading] = useState(false);
  const [focusedCamera, setFocusedCamera] = useState<Camera>();
  const [confirm, setConfirm] = useState<ConfirmProps>();

  const { t } = useTranslation();
  const history = useHistory();

  async function loadCameras() {
    setLoading(true);
    setCameras([]);
    try {
      const loadedCameras = await cameraController.getAll();
      setCameras(loadedCameras);
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
      <Nav />
      <div className="dash-header">
        <h1>{t('dashboard.header')}</h1>
      </div>
      {confirm && (
        <Confirm
          cancelHandler={confirm.cancelHandler}
          successHandler={confirm.successHandler}
          message={confirm.message}
        />
      )}
      {error && (
        <ErrorBox
          error={t('error.FAILED_LOADING_CAMERAS')}
          complete={error}
          exitHandler={() => setError(undefined)}
          className="error-loading-cameras"
        />
      )}
      {focusedCamera && (
        <Modal exitHandler={() => setFocusedCamera(undefined)}>
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
              <Card key={`camera-${camera.id}`} className="camera-container">
                <Stream
                  camera={camera}
                  onClick={() => {
                    setFocusedCamera(camera);
                  }}
                />
                <div className="camera-name">
                  <FontAwesomeIcon
                    className="delete-camera"
                    icon={faTrashAlt}
                    onClick={() => {
                      setConfirm({
                        cancelHandler: () => setConfirm(undefined),
                        successHandler: async () => {
                          setConfirm(undefined);
                          setLoading(true);
                          await camera.delete();
                          await loadCameras();
                        },
                        message: t('dashboard.deleteConfirm'),
                      });
                    }}
                  />
                  <div className="camera-name-text">{camera.name}</div>
                </div>
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
