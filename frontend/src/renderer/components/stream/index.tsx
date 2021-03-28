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

const noVideo = require.resolve('_public/images/no_video.png');

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
