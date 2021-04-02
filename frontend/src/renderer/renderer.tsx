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
import { useTranslation } from 'react-i18next';
import { Home, Load, Login, Register } from './public';

import { Auth } from './controllers/auth';
import {
  ConfigPage,
  Dashboard,
  Detect,
  Detections,
  Logs,
  NewDevice,
  PersonDetail,
  Persons,
} from './protected';
import { User } from './controllers/user';
import { DetectionWorker } from './controllers/detection';
import Config from './controllers/config';

const configController = new Config();

type newDeviceParams = { id: string };
type personDetailParams = { id: string };
type personDetectionParams = { id: string };

let worker: DetectionWorker;

export async function startWorker(user: User): Promise<void> {
  worker = new DetectionWorker(user);
  await worker.init();
}

export function getWorker(): DetectionWorker {
  return worker;
}

export async function restartWorker(keepProcess = true): Promise<void> {
  worker = worker.restartWorker(keepProcess);
  await worker.init();
}

const { useState, useEffect } = React;

function Routes(): JSX.Element {
  const { i18n } = useTranslation();
  const vars = configController.get();
  const [isLoggedIn, setLogged] = useState(false);
  const [isMainLoading, setMainLoading] = useState(true);

  const auth = new Auth();

  useEffect(() => {
    void i18n.changeLanguage(vars.LANGUAGE);
  }, []);

  useEffect(() => {
    const check = () => {
      const isLogged = auth.isLogged();
      if (isLogged !== isLoggedIn) setLogged(isLogged);
    };
    check();
    auth.onChange(check);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setMainLoading(true);
      const user = auth.getUser();
      if (!worker) {
        startWorker(user).finally(() => {
          setMainLoading(false);
        });
      } else {
        switch (worker.status) {
          case 'stopped':
            restartWorker().finally(() => {
              setMainLoading(false);
            });
            break;
          case 'working':
            setMainLoading(false);
            break;
          case 'unitialized':
            startWorker(user).finally(() => {
              setMainLoading(false);
            });
            break;
          default:
            setMainLoading(false);
            break;
        }
      }
    }
  }, [isLoggedIn]);

  function c(element: () => JSX.Element): () => JSX.Element {
    if (isLoggedIn && isMainLoading) return Load;
    return isLoggedIn ? element : Login;
  }

  function cr(element: JSX.Element): JSX.Element {
    if (isLoggedIn && isMainLoading) return <Load />;
    return isLoggedIn ? element : <Login />;
  }

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/home" component={Home} />
        <Route
          exact
          path="/logout"
          render={() => {
            auth.logout();
            return <Home />;
          }}
        />
        <Route exact path="/dashboard" component={c(Dashboard)} />
        <Route exact path="/detect" component={c(Detect)} />
        <Route exact path="/persons" component={c(Persons)} />
        <Route exact path="/logs" component={c(Logs)} />
        <Route exact path="/config" component={c(ConfigPage)} />
        <Route
          exact
          path="/new-device/:id"
          render={({ match }: RouteComponentProps<newDeviceParams>) => {
            const element = cr(<NewDevice paramId={match.params.id} />);
            return element;
          }}
        />
        <Route
          exact
          path="/person/:id"
          render={({ match }: RouteComponentProps<personDetailParams>) => {
            const param = match.params.id;
            if (!param) return <Redirect to="/persons" />;
            if (param === 'new') {
              return cr(<PersonDetail new />);
            }
            const id = parseInt(param, 10);
            if (!Number.isNaN(id)) {
              return cr(<PersonDetail id={id} />);
            }
            return <Redirect to="/persons" />;
          }}
        />
        <Route exact path="/detections" component={Detections} />
        <Route
          exact
          path="/detection/:id"
          render={({ match }: RouteComponentProps<personDetectionParams>) => {
            if (!match.params.id) return cr(<Detections />);
            const id = parseInt(match.params.id, 10);
            if (Number.isNaN(id)) return cr(<Detections />);
            return cr(<Detections personId={id} />);
          }}
        />
        <Route path="/" component={isLoggedIn ? Dashboard : Home} />
      </Switch>
    </HashRouter>
  );
}

ReactDOM.render(<Routes />, document.getElementById('app'));
