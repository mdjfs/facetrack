import { faHamburger, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import './nav.css';

const { useState } = React;

type linkRoute = {
  name: string;
  link: string;
};

function Nav(): JSX.Element {
  const { pathname } = useLocation();
  const [isOpen, setOpen] = useState(false);
  const { t } = useTranslation();
  const links: linkRoute[] = [
    {
      name: t('nav.dashboard'),
      link: '/dashboard',
    },
    {
      name: t('nav.persons'),
      link: '/persons',
    },
    {
      name: t('nav.detections'),
      link: '/detections',
    },
    {
      name: t('nav.logs'),
      link: '/logs',
    },
    {
      name: t('nav.config'),
      link: '/config',
    },
    {
      name: t('nav.logout'),
      link: '/logout',
    },
  ];
  if (!isOpen) {
    return (
      <div className="nav-closed">
        <FontAwesomeIcon
          className="hamburger"
          icon={faHamburger}
          onClick={() => setOpen(true)}
        />
      </div>
    );
  }
  return (
    <>
      <div className="nav-background" onClick={() => setOpen(false)} />
      <div className="nav-open">
        <FontAwesomeIcon
          icon={faTimesCircle}
          className="nav-exit"
          onClick={() => setOpen(false)}
        />
        <div className="nav-link-container">
          {links.map((link, index) => (
            <Link
              key={`nav-link-${link.name}${link.link}`}
              className={`nav-link ${
                index <= 5 ? `nav-index-${index}` : 'nav-hidden'
              } ${link.link === pathname ? 'focused' : ''}`}
              to={link.link}>
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Nav;
