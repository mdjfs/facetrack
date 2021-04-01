/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import {
  faArrowCircleLeft,
  faArrowCircleRight,
  faCircle as circleSolid,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle as circleRegular } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Modal } from '..';
import './gallery.css';

interface Image {
  src: string;
  alt?: string;
}

interface GalleryProps {
  images: Image[];
  canMaximize?: boolean;
}

interface RegisteredImage extends Image {
  index: number;
}

const { useState, useEffect } = React;

function Gallery({ images, canMaximize = false }: GalleryProps): JSX.Element {
  const [focused, setFocused] = useState<RegisteredImage>();
  const [isMaximized, setMaximized] = useState(false);
  const registeredImages: RegisteredImage[] = images.map((value, index) => ({
    ...value,
    index,
  }));

  function isNext(): boolean {
    return focused !== undefined && focused.index + 1 < registeredImages.length;
  }

  function isPrev(): boolean {
    return focused !== undefined && focused.index - 1 >= 0;
  }

  function next(): void {
    if (isNext() && focused) {
      setFocused(registeredImages[focused.index + 1]);
    }
  }

  function prev(): void {
    if (isPrev() && focused) {
      setFocused(registeredImages[focused.index - 1]);
    }
  }

  function set(index: number) {
    if (registeredImages[index]) {
      setFocused(registeredImages[index]);
    }
  }

  useEffect(() => {
    setFocused(registeredImages[0]);
  }, []);

  const status = isMaximized ? 'maximized' : 'normal';

  const gallery = (
    <div className="gallery-container">
      {focused && (
        <>
          {isPrev() && (
            <FontAwesomeIcon
              className="prev-button"
              onClick={() => prev()}
              icon={faArrowCircleLeft}
            />
          )}
          <div className={`image-container ${canMaximize ? status : ''}`}>
            <img
              src={focused.src}
              onClick={() => setMaximized(!isMaximized)}
              alt={focused.alt || 'Gallery'}
            />
          </div>
          <div className="image-indexs">
            {registeredImages.map(({ index }) => {
              const icon = (index === focused.index
                ? circleSolid
                : circleRegular) as IconDefinition;
              return (
                <FontAwesomeIcon
                  className="image-index"
                  icon={icon}
                  key={`move-to-${index}`}
                  onClick={() => set(index)}
                />
              );
            })}
          </div>
          {isNext() && (
            <FontAwesomeIcon
              className="next-button"
              onClick={() => next()}
              icon={faArrowCircleRight}
            />
          )}
        </>
      )}
    </div>
  );

  return isMaximized && canMaximize ? (
    <>
      {gallery}
      <Modal exitHandler={() => setMaximized(false)}>{gallery}</Modal>
    </>
  ) : (
    gallery
  );
}

export default Gallery;
