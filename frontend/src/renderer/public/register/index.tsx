/* eslint-disable sort-imports */
/* eslint-disable import/extensions */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as config from '../../config.json';
import {
  Button, Header, Input, Presentation,
} from '../../components';
import { Auth as AuthController, RegisterState } from '../../controllers/auth';

const { useReducer } = React;
const auth = new AuthController();

function Register(): JSX.Element {
  const defaultState: RegisterState = {
    username: '', email: '', password: '', names: '', surnames: '',
  };
  const reducer = auth.getRegisterReducer();
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <Presentation>
        <Input
          placeholder={t('register.inputs.names.placeholder')}
          name={t('register.inputs.names.name')}
          handler={(payload: string) => dispatch({ type: 'setNames', payload })}
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
          handler={(payload: string) => dispatch({ type: 'setEmail', payload })}
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
          className="left-button"
          content={t('register.buttons.register')}
          onClick={() => {
            auth.register(state)
              .then((result) => console.log(result))
              .catch((error) => console.error(error));
          }}
        />
      </Presentation>
    </>
  );
}

export default Register;
