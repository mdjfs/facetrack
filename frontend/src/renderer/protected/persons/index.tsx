import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Nav } from '_/renderer/components';
import './persons.css';

function Persons(): JSX.Element {
  const { t } = useTranslation();
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
      </div>
    </>
  );
}

export default Persons;
