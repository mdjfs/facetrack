/* eslint-disable max-len */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import {
  faCircleNotch,
  faExclamationTriangle,
  faRedo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Snapshot } from 'node-onvif-ts';
import * as React from 'react';
import Camera from '_/renderer/controllers/camera';
import Recognition from '_/renderer/controllers/recognition';
import Tooltip from '../tooltip';
import './stream.css';

const recognition = new Recognition();
const { useState, useEffect, useRef } = React;

interface StreamProps {
  camera: Camera;
  latency?: number;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  detectFaces?: boolean;
}

const noVideo =
  ' data:image/png;base64,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';

function Stream({
  camera,
  latency = 500,
  className = '',
  onClick = undefined,
  detectFaces = false,
}: StreamProps): JSX.Element {
  const [imageUri, setImageUri] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  function snapToUrl(snap: Snapshot) {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(snap.body)));
    return `data:${
      snap.headers['content-type'] || 'image/jpeg'
    };base64,${base64}`;
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function stream() {
    const init = performance.now();
    let url: string | undefined;
    try {
      if (detectFaces) {
        if (canvasRef.current && imageRef.current) {
          await recognition.drawDetections(imageRef.current, canvasRef.current);
        }
      }
      const snap = await camera.getSnapshot();
      if (snap) url = snapToUrl(snap);
      if (url) setImageUri(url);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      const finish = performance.now();
      const lapsed = finish - init;
      if (lapsed < latency) {
        const difference = latency - lapsed;
        await delay(difference);
      }
    }
  }

  async function loadImage() {
    setLoading(true);
    try {
      await camera.connect();
      await stream();
    } catch (e) {
      setError(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (imageUri !== '') void stream();
  }, [imageUri]);

  useEffect(() => {
    void loadImage();
  }, []);

  if (error) {
    return (
      <div className={`stream-error app-stream ${className}`}>
        <Tooltip message={error.message} className="camera-exclamation">
          <FontAwesomeIcon icon={faExclamationTriangle} />
        </Tooltip>
        <FontAwesomeIcon
          className="camera-restart"
          icon={faRedo}
          onClick={() => loadImage()}
        />
        <img className="image-error" src={noVideo} alt="No video" />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className={`stream-loading app-stream ${className}`}>
        <FontAwesomeIcon icon={faCircleNotch} spin />
      </div>
    );
  }
  if (detectFaces) {
    return (
      <div className={`detect-faces-container ${className}`}>
        <img
          className="image-loaded app-stream"
          onClick={onClick}
          src={imageUri}
          alt="Stream"
          ref={imageRef}
        />
        <canvas ref={canvasRef} />
      </div>
    );
  }
  return (
    <img
      className={`image-loaded app-stream ${className}`}
      onClick={onClick}
      src={imageUri}
      alt="Stream"
    />
  );
}

export default Stream;
