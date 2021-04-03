import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router';
import {
  Button,
  ErrorBox,
  Header,
  Input,
  Presentation,
} from '../../components';
import { Auth as AuthController, RegisterState } from '../../controllers/auth';
import './register.css';

import * as config from '../../config.json';

const { useReducer, useState } = React;
const auth = new AuthController();

function Register(): JSX.Element {
  const defaultState: RegisterState = {
    username: '',
    email: '',
    password: '',
    names: '',
    surnames: '',
  };
  const reducer = auth.getRegisterReducer();
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const { t } = useTranslation();
  const history = useHistory();

  async function register(info: RegisterState) {
    setLoading(true);
    try {
      await auth.register(info);
      history.push('/dashboard');
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
        {isLoading && (
          <FontAwesomeIcon
            className="register-loading"
            icon={faCircleNotch}
            spin
          />
        )}
        {!isLoading && (
          <>
            {error && (
              <ErrorBox
                error={t('error.REGISTER_FAILED')}
                complete={error}
                exitHandler={() => setError(undefined)}
              />
            )}
            <Input
              placeholder={t('register.inputs.names.placeholder')}
              name={t('register.inputs.names.name')}
              handler={(payload: string) => {
                dispatch({ type: 'setNames', payload });
              }}
            />
            <Input
              placeholder={t('register.inputs.surnames.placeholder')}
              name={t('register.inputs.surnames.name')}
              handler={(payload: string) => {
                dispatch({ type: 'setSurnames', payload });
              }}
            />
            <Input
              placeholder={t('register.inputs.user.placeholder')}
              name={t('register.inputs.user.name')}
              handler={(payload: string) => {
                dispatch({ type: 'setUsername', payload });
              }}
              validator={new RegExp(config.REG_EXPRESSIONS.username)}
              validatorMessage={t('register.inputs.user.validatorMessage')}
            />
            <Input
              placeholder={t('register.inputs.email.placeholder')}
              name={t('register.inputs.email.name')}
              handler={(payload: string) => {
                dispatch({ type: 'setEmail', payload });
              }}
              validator={new RegExp(config.REG_EXPRESSIONS.email)}
              validatorMessage={t('register.inputs.email.validatorMessage')}
            />
            <Input
              placeholder={t('register.inputs.password.placeholder')}
              name={t('register.inputs.password.name')}
              handler={(payload: string) => {
                dispatch({ type: 'setPassword', payload });
              }}
              validator={new RegExp(config.REG_EXPRESSIONS.password)}
              validatorMessage={t('register.inputs.password.validatorMessage')}
              password
            />
            <Button
              theme="secondary"
              content={t('register.buttons.register')}
              onClick={() => register(state)}
            />
          </>
        )}
      </Presentation>
    </>
  );
}

export default Register;
