import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Dashboard from '../dashboard';
import { Nav } from '../../components';

const { useState } = React;

function Routes(): JSX.Element {
  const { t } = useTranslation();
  const pages: [string, JSX.Element][] = [
    [t('routes.dashboard'), <Dashboard />],
  ];
  const [component, setComponent] = useState<JSX.Element>(<Dashboard />);
  return (
    <>
      <Nav
        links={pages.map((page) => ({
          content: page[0],
          onClick: () => setComponent(page[1]),
        }))}
      />
      {component}
    </>
  );
}

export default Routes;
