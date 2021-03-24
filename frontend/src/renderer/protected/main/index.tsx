/* eslint-disable sort-imports */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import Dashboard from '../dashboard';
import { Nav } from '../../components';
import { useTranslation } from 'react-i18next';

const { useState } = React;


function Routes(): JSX.Element {
  const { t } = useTranslation();
  const pages: [string, JSX.Element][] = [[t('routes.dashboard'), <Dashboard/>]];
  const [component, setComponent] = useState<JSX.Element>(<Dashboard/>);
  return <React.Fragment>
      <Nav links={pages.map(page => ({content: page[0], onClick: () => setComponent(page[1])}) )}/>
      {component}
  </React.Fragment>
}

export default Routes;