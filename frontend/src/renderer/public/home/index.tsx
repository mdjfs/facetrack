/* eslint-disable sort-imports */
/* eslint-disable import/extensions */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import {Button, Header, Link, Presentation} from '../../components';
import './home.css';

const { useState } = React;

function Home(): JSX.Element {

  const [modal, setModal] = useState<React.ReactNode>(null);
  const history = useHistory();
  const {t} = useTranslation();
  return (
    <>
      <Header />
      {modal && 
      <div className="home-modal">
          {modal}
          <button className="home-modal-exit" onClick={() => setModal(null)}></button>
      </div>
      }
      <Presentation>
        <Button theme="primary" className="scale-button margin-top" content={t('home.buttons.join')} onClick={() => history.push("/login")}/>
        <Button theme="secondary" className="scale-button" content={t('home.buttons.continue')} onClick={() => console.log('holi')}/>
        <Link className="link-right" content={t('home.link.new')} onClick={() => setModal(<div>Test</div>)}></Link>
      </Presentation>
    </>
  );
}

export default Home;