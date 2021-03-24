import * as React from "react";
import Camera from "_/renderer/controllers/camera";

const { useState, useEffect } = React;

interface StreamProps {
  camera: Camera;
  latency?: number;
}

function Stream({ camera, latency = 500 }: StreamProps): JSX.Element {
  const [imageUri, setImageUri] = useState("");

  async function loadImage() {
    const device = camera.getDevice();
    if (device) {
      const image = await device.device.fetchSnapshot();
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(image.body))
      );
      setImageUri(`data:image/png;base64,${base64String}`);
      setTimeout(() => {
        loadImage();
      }, latency);
    }
  }

  useEffect(() => {
    loadImage();
  }, []);

  return <img src={imageUri} />;
}

export default Stream;
