import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Nav } from '_/renderer/components';
import Log from '_/renderer/controllers/log';
import './logs.css';

function Logs(): JSX.Element {
  const logController = new Log();
  const { t } = useTranslation();
  const messages = logController.getMessages();
  return (
    <>
      <Nav />
      <div className="logs">
        {messages.map((msg) => {
          const date = msg.date.toLocaleDateString();
          const time = msg.date.toLocaleTimeString();
          const key = `${msg.translation}-${time}`;
          return (
            <div key={key} className="log-msg">
              {`[${date} - ${time}] ${t(msg.translation, msg.params)}`}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Logs;
