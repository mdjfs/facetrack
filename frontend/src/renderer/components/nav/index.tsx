/* eslint-disable sort-imports */
import { faHamburger, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import './nav.css';

interface ChildrensProp{
  content: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

interface NavProps{
    links: ChildrensProp[]
}

const { useState } = React;

function Nav({ links }: NavProps): JSX.Element {
  const [isOpen, setOpen] = useState(false);
  if(!isOpen){
    return <div className="nav-closed" onClick={() => setOpen(true)}><FontAwesomeIcon icon={faHamburger}></FontAwesomeIcon></div>
  }else{
    return <div className="nav-open">
        <FontAwesomeIcon icon={faTimesCircle} className="nav-exit" onClick={ () => setOpen(false) }></FontAwesomeIcon>
        {links.map(link => <div className="nav-link" onClick={link.onClick}>{link.content}</div>)}
    </div>
  }
}

export default Nav;