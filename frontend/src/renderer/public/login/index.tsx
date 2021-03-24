/* eslint-disable sort-imports */
/* eslint-disable import/extensions */

import * as React from "react";
import * as config from "../../config.json";

import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import {
  LoginState,
  Auth as AuthController,
} from "_/renderer/controllers/auth";
import {
  Button,
  Header,
  Input,
  Presentation,
  ErrorBox,
} from "../../components";
import "./login.css";
import { useHistory } from "react-router";

const { useState, useReducer } = React;

const auth = new AuthController();

function Login(): JSX.Element {
  const defaultState: LoginState = {
    username: undefined,
    email: undefined,
    password: "",
  };
  const reducer = auth.getLoginReducer();
  const [state, dispatch] = useReducer(reducer, defaultState);

  const history = useHistory();

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation();

  async function login(state: LoginState) {
    setLoading(true);
    try {
      const [error] = await auth.login(state);
      if (error) throw error;
      history.push("/dashboard");
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <Presentation>
        {isLoading && <FontAwesomeIcon icon={faSpinner} spin></FontAwesomeIcon>}
        {!isLoading && (
          <>
            {error && (
              <ErrorBox
                error={t("error.LOGIN_FAILED")}
                complete={error}
                exitHandler={() => setError(null)}
              />
            )}
            <Input
              placeholder={t("login.inputs.user.placeholder")}
              name={t("login.inputs.user.name")}
              handler={(payload: string) => {
                if (new RegExp(config.REG_EXPRESSIONS.email).test(payload)) {
                  dispatch({ type: "setEmail", payload });
                } else if (
                  new RegExp(config.REG_EXPRESSIONS.username).test(payload)
                ) {
                  dispatch({ type: "setUsername", payload });
                }
              }}
              validator={null}
              validatorMessage={null}
            />
            <Input
              placeholder={t("login.inputs.password.placeholder")}
              name={t("login.inputs.password.name")}
              handler={(payload: string) => {
                dispatch({ type: "setPassword", payload });
              }}
              password
            />
            <Button
              theme="primary"
              content={t("login.buttons.login")}
              onClick={() => login(state)}
            />
            <Button
              theme="secondary"
              className="left-button"
              content={t("login.buttons.register")}
              onClick={() => history.push("/register")}
            />
          </>
        )}
      </Presentation>
    </>
  );
}

export default Login;
