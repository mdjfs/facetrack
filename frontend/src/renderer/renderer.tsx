/* eslint-disable import/extensions */
/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import "_public/style.css";
import "_public/i18n/config";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Home, Login, Register } from "./public";

import AuthController from "./controllers/auth";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import { Dashboard, Detect, NewDevice } from "./protected";

const auth = new AuthController();

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
        <Route
          exact
          path="/new-device/:id"
          render={({ match }) => guard(<NewDevice id={match.params.id} />)()}
        />
      </Switch>
    </HashRouter>
  );
}

ReactDOM.render(<Routes />, document.getElementById("app"));
