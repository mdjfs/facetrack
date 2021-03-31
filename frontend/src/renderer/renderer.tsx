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

import { Auth } from './controllers/auth';
import {
  Dashboard,
  Detect,
  NewDevice,
  PersonDetail,
  Persons,
} from './protected';
import { User } from './controllers/user';
import { DetectionWorker } from './controllers/detection';

const auth = new Auth();

type newDeviceParams = { id: string };
type personDetailParams = { id: string };

let worker: DetectionWorker;

export function startWorker(user: User): void {
  worker = new DetectionWorker(user);
}

export function restartWorker(keepProcess = true): void {
  worker = worker.restartWorker(keepProcess);
}

if (auth.isLogged()) {
  const user = auth.getUser();
  startWorker(user);
}

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
        <Route
          exact
          path="/person/:id"
          render={({ match }: RouteComponentProps<personDetailParams>) => {
            const param = match.params.id;
            if (!param) return <Redirect to="/persons" />;
            if (param === 'new') {
              const component = <PersonDetail new />;
              return guard(component)();
            }
            const id = parseInt(param, 10);
            if (!Number.isNaN(id)) {
              const component = <PersonDetail id={id} />;
              return guard(component)();
            }
            return <Redirect to="/persons" />;
          }}
        />
      </Switch>
    </HashRouter>
  );
}

ReactDOM.render(<Routes />, document.getElementById('app'));
