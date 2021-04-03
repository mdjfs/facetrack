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
              <div className="guestAlert">
                {t('home.continueAlert')}
                <br />
                <Button
                  theme="secondary"
                  content={t('home.buttons.continue')}
                  onClick={async () => {
                    setModal(
                      <div className="guestAlert">
                        <FontAwesomeIcon
                          className="guest-loading"
                          icon={faCircleNotch}
                          spin
                        />
                      </div>,
                    );
                    await auth.guest();
                    history.push('/dashboard');
                    window.location.reload();
                  }}
                />
              </div>,
            );
          }}
        />
        <CustomLink
          className="link-right"
          content={t('home.link.new')}
          onClick={() => {
            setModal(
              <div className="newInfo">
                {t('home.explain')}
                <Button
                  theme="secondary"
                  content={t('home.buttons.demo')}
                  onClick={() => {
                    setModal(
                      <div className="newInfo video">
                        <iframe src={t('home.videoDemoLink')} title="Demo" />
                      </div>,
                    );
                  }}
                />
              </div>,
            );
          }}
        />
      </Presentation>
    </>
  );
}

export default Home;
