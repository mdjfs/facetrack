/* eslint-disable import/extensions */
/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';
import '_public/i18n/config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Home} from './public';

ReactDOM.render(
  <Home/>
  ,
  document.getElementById('app'),
);
