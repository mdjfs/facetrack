import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Nav } from '_/renderer/components';
import { Config, InputVars } from '_/renderer/controllers/config';
import Select from 'react-select';
import './config.css';

const configController = new Config();

const { useState } = React;

function ConfigPage(): JSX.Element {
  const { t } = useTranslation();
  const [isChanged, setChanged] = useState(false);

  function set(config: InputVars) {
    configController.set(config);
    setChanged(true);
  }

  return (
    <>
      <Nav />
      <div className="config">
        <strong>{t('config.selectLanguage')}:</strong>
        <Select
          options={[
            {
              value: 'en',
              label: t('config.english').toString(),
            },
            {
              value: 'es',
              label: t('config.spanish').toString(),
            },
          ]}
          onChange={(selected) => {
            if (
              selected &&
              (selected.value === 'en' || selected.value === 'es')
            ) {
              set({
                LANGUAGE: selected.value,
              });
            }
          }}
        />
        {isChanged && (
          <Button
            content={t('config.save')}
            theme="primary"
            onClick={() => window.location.reload()}
          />
        )}
      </div>
    </>
  );
}

export default ConfigPage;
