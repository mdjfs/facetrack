import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Nav } from '_/renderer/components';
import Recognition from '_/renderer/controllers/recognition';
import './persons.css';

const recognition = new Recognition();

const test = require.resolve('_public/images/cv.jpg');

function Persons(): JSX.Element {
  const { t } = useTranslation();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  function loadDetect() {
    console.log('clickeao');
    if (imgRef.current && canvasRef.current) {
      void recognition.drawDetections(imgRef.current, canvasRef.current);
    }
  }
  return (
    <>
      <Nav />
      <div className="persons-header">
        <h1>{t('persons.header')}</h1>
      </div>
      <div className="persons-cards">
        <Card size="large">
          Name: -----
          <Button
            theme="primary"
            content="edit"
            onClick={() => console.log('holi')}
          />
        </Card>
        <Button
          theme="primary"
          content="create"
          onClick={() => console.log('holi')}
        />
        <div className="test-container" onClick={() => loadDetect()}>
          <img ref={imgRef} src={test} alt="test" />
          <canvas ref={canvasRef} />
        </div>
      </div>
    </>
  );
}

export default Persons;
