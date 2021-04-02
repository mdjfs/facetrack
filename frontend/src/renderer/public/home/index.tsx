import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import Auth from '_/renderer/controllers/auth';
import { Button, CustomLink, Header, Presentation } from '../../components';
import './home.css';

const { useState } = React;

const auth = new Auth();

function Home(): JSX.Element {
  const history = useHistory();
  const [modal, setModal] = useState<React.ReactNode>(null);
  const { t } = useTranslation();
  return (
    <>
      <Header />
      {modal && (
        <div className="home-modal">
          {modal}
          <button
            className="home-modal-exit"
            type="button"
            aria-label="exit"
            onClick={() => setModal(null)}
          />
        </div>
      )}
      <Presentation>
        <Button
          theme="primary"
          className="scale-button margin-top"
          content={t('home.buttons.join')}
          onClick={() => history.push('/login')}
        />
        <Button
          theme="secondary"
          className="scale-button"
          content={t('home.buttons.continue')}
          onClick={() => {
            setModal(
              <>
                {t('home.continueAlert')}
                <br />
                <Button
                  theme="secondary"
                  content={t('home.buttons.continue')}
                  onClick={async () => {
                    setModal(<FontAwesomeIcon icon={faCircleNotch} spin />);
                    await auth.guest();
                    history.push('/dashboard');
                    window.location.reload();
                  }}
                />
              </>,
            );
          }}
        />
        <CustomLink
          className="link-right"
          content={t('home.link.new')}
          onClick={() => setModal(<div>Test</div>)}
        />
      </Presentation>
    </>
  );
}

export default Home;
