/* eslint-disable sort-imports */
/* eslint-disable import/extensions */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/button';
import Header from '../../components/header';
import Input from '../../components/input';
import Presentation from '../../components/presentation';
import './login.css';

function Login(): JSX.Element {
  
  const {t} = useTranslation();
  return (
    <>
      <Header />
      <Presentation>
        <Input
          placeholder={t('login.inputs.user.placeholder')}
          name={t('login.inputs.user.name')}
          handler={() => console.log('holi')}
          validator={null}
          validatorMessage={null}
        />
        <Input
          placeholder={t('login.inputs.password.placeholder')}
          name={t('login.inputs.password.name')}
          handler={() => console.log('holi')}
          password={true}
        />
        <Button theme="primary" content={t('login.buttons.login')} onClick={() => console.log('holi')}/>
        <Button theme="secondary" className="left-button" content={t('login.buttons.register')} onClick={() => console.log('holi')}/>
      </Presentation>
    </>
  );
}

export default Login;
