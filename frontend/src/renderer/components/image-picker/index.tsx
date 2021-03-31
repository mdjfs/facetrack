import * as React from 'react';
import './picker.css';

const { useState, useEffect } = React;

export interface PickImage {
  src: string;
  key?: string | number;
  data?: unknown;
}

export interface PickProps {
  images: PickImage[];
  multiple: boolean;
  className?: string;
  handler(image: PickImage | PickImage[]): void;
}

function ImagePicker({
  images,
  handler,
  multiple = false,
  className = '',
}: PickProps): JSX.Element {
  const [picked, setPicked] = useState<number[]>();

  useEffect(() => {
    if (picked) {
      if (multiple) {
        const imgs = images.filter((_, index) => picked.includes(index));
        handler(imgs);
      } else {
        const [image] = images.filter((_, index) => picked.includes(index));
        handler(image);
      }
    }
  }, [picked]);

  return (
    <div className={`image-picker-container ${className}`}>
      {images.map((image, index) => (
        <div
          className={`pick-img-container ${
            picked && picked.includes(index) ? 'picked' : ''
          }`}
          key={`image-${image.key ? image.key : image.src}`}
          onClick={() => {
            if (multiple) {
              if (!picked) {
                setPicked([index]);
              } else if (picked.includes(index)) {
                setPicked(picked.filter((value) => value !== index));
              } else {
                setPicked([...picked, index]);
              }
            } else {
              setPicked([index]);
            }
          }}>
          <img
            src={image.src}
            className={`pick-img ${
              picked && picked.includes(index) ? 'picked' : ''
            }`}
            alt={image.key as string}
          />
        </div>
      ))}
    </div>
  );
}

export default ImagePicker;
