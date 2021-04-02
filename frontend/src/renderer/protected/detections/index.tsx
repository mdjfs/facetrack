import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cancelable, CancelablePromiseType } from 'cancelable-promise';
import { Button, Card, ErrorBox, Nav } from '_/renderer/components';
import './detection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router';
import Detection from '../../controllers/detection';

interface DetectionProps {
  personId?: number;
}

const { useState, useEffect, useRef } = React;

function Detections({ personId = undefined }: DetectionProps): JSX.Element {
  const detectionController = new Detection();
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [page, setPage] = useState(1);
  const [isLastPage, setLastPage] = useState(false);
  const history = useHistory();
  const refDiv = useRef<HTMLDivElement>(null);

  async function process(processAsync: () => Promise<void>): Promise<void> {
    setLoading(true);
    try {
      await processAsync();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadByPerson(id: number) {
    await process(async () => {
      const getDetections = await detectionController.getByPerson(id);
      for (const detection of getDetections) {
        await detection.person.getData();
        await detection.camera.getData();
      }
      setDetections(getDetections);
    });
  }

  async function loadPage() {
    if (!isLastPage) {
      await process(async () => {
        const getDetections = await detectionController.getByPage(page);
        if (getDetections.length > 0) {
          const loadedDetections = detections || [];
          for (const detection of getDetections) {
            await detection.person.getData();
            await detection.camera.getData();
          }
          setDetections([...loadedDetections, ...getDetections]);
          setPage(page + 1);
        } else setLastPage(true);
      });
    }
  }

  useEffect(() => {
    if (personId) {
      const promise: CancelablePromiseType<void> = cancelable(
        loadByPerson(personId),
      );
      return () => {
        promise.cancel();
      };
    }
    const promise: CancelablePromiseType<void> = cancelable(loadPage());
    return () => {
      promise.cancel();
    };
  }, []);

  function scrollCheck(e: React.UIEvent<HTMLDivElement>) {
    const element = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const bottom = scrollHeight - scrollTop === clientHeight;
    if (bottom && !personId) {
      void loadPage().then(() => {
        if (refDiv.current) {
          if (scrollTop > 0) refDiv.current.scrollTop = scrollTop;
        }
      });
    }
  }

  return (
    <div
      className="scroll-wrapper"
      onScroll={(e) => scrollCheck(e)}
      ref={refDiv}>
      <Nav />
      <div className="detections-header">
        <h1>{t('detections.header')}</h1>
      </div>

      {error && (
        <ErrorBox
          error={t('error.FAILED_LOADING_DETECTIONS')}
          complete={error}
          exitHandler={() => setError(undefined)}
          className="error-loading-detections"
        />
      )}

      {isLoading && (
        <FontAwesomeIcon
          className="detections-loading"
          icon={faCircleNotch}
          spin
        />
      )}
      {!isLoading && (
        <div className="detections-body">
          {detections.map((detection) => (
            <Card>
              <ul>
                {detection.person.registered && (
                  <li>
                    <strong>{t('detections.list.person')}:</strong>
                    {` ${detection.person.names} ${detection.person.surnames}`}
                  </li>
                )}
                {!detection.person.registered && (
                  <li>
                    <strong>{t('detections.list.person')}:</strong>
                    {` ${t('detections.list.unknown')}`}
                  </li>
                )}
                <li>
                  <strong>{t('detections.list.camera')}:</strong>
                  {` ${detection.camera.name}`}
                </li>
                <li>
                  <strong>{t('detections.list.since')}:</strong>
                  {` ${detection.since.toLocaleDateString()} 
                  ${detection.since.toLocaleTimeString()}`}
                </li>
                <li>
                  <strong>{t('detections.list.until')}:</strong>
                  {` ${detection.until.toLocaleDateString()} 
                  ${detection.until.toLocaleTimeString()}`}
                </li>
              </ul>
              <Button
                theme="primary"
                onClick={() => {
                  history.push(`/person/${detection.person.id}`);
                }}
                content={t('detections.buttons.see')}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Detections;
