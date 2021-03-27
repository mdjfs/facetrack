/* eslint-disable import/extensions */
/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import '_public/style.css';
import '_public/i18n/config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  HashRouter,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from 'react-router-dom';
import { Home, Login, Register } from './public';

import AuthController from './controllers/auth';
import { Dashboard, Detect, NewDevice, Persons } from './protected';

const auth = new AuthController();

type newDeviceParams = { id: string };

function Routes(): JSX.Element {
  function guard(component: JSX.Element) {
    return () => (auth.isLogged() ? component : <Redirect to="/login" />);
  }
  function check(component: JSX.Element) {
    return () => (auth.isLogged() ? <Redirect to="/dashboard" /> : component);
  }

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/login" render={check(<Login />)} />
        <Route exact path="/register" render={check(<Register />)} />
        <Route exact path="/home" render={check(<Home />)} />
        <Route exact path="/" render={check(<Home />)} />

        <Route exact path="/dashboard" render={guard(<Dashboard />)} />
        <Route exact path="/detect" render={guard(<Detect />)} />
        <Route exact path="/persons" render={guard(<Persons />)} />
        <Route
          exact
          path="/new-device/:id"
          render={({ match }: RouteComponentProps<newDeviceParams>) => {
            const component = <NewDevice paramId={match.params.id} />;
            return guard(component)();
          }}
        />
      </Switch>
    </HashRouter>
  );
}

ReactDOM.render(<Routes />, document.getElementById('app'));
