import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cancelable, CancelablePromiseType } from 'cancelable-promise';
import {
  Button,
  Card,
  Confirm,
  ConfirmProps,
  ErrorBox,
  Gallery,
  Nav,
} from '_/renderer/components';
import Person, { PersonData } from '_/renderer/controllers/person';
import './persons.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router';

const { useState, useEffect } = React;

interface DisplayPerson extends PersonData {
  images: string[];
  getPerson: () => Person;
}

function Persons(): JSX.Element {
  const history = useHistory();
  const { t } = useTranslation();
  const [people, setPeople] = useState<'known' | 'unknown'>('known');
  const [isLoading, setLoading] = useState(false);
  const [personsData, setPersonsData] = useState<DisplayPerson[]>([]);
  const [error, setError] = useState<Error>();
  const [confirm, setConfirm] = useState<ConfirmProps>();

  const personController = new Person();

  function bufferToUrl(buffer: Buffer, mimetype = 'image/jpeg'): string {
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    return `data:${mimetype};base64,${base64}`;
  }

  async function loadPersons() {
    setLoading(true);
    try {
      const getPersons = await personController.getAll();
      const data: DisplayPerson[] = [];
      for (const person of getPersons) {
        const faces = await person.getFaces();
        const personData = await person.getData();
        const display: DisplayPerson = {
          ...personData,
          images: faces.map((face) => bufferToUrl(face.buffer, face.mimetype)),
          getPerson: () => person,
        };
        data.push(display);
      }
      setPersonsData(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const promise: CancelablePromiseType<void> = cancelable(loadPersons());
    return () => {
      promise.cancel();
    };
  }, []);

  return (
    <>
      <Nav />
      <div className="persons-header">
        <h1>{t('persons.header')}</h1>
      </div>

      {error && (
        <ErrorBox
          error={t('error.FAILED_LOADING_PERSONS')}
          complete={error}
          exitHandler={() => setError(undefined)}
          className="error-loading-persons"
        />
      )}

      {confirm && (
        <Confirm
          cancelHandler={confirm.cancelHandler}
          successHandler={confirm.successHandler}
          message={confirm.message}
        />
      )}

      {isLoading && (
        <FontAwesomeIcon
          className="persons-loading"
          icon={faCircleNotch}
          spin
        />
      )}
      {!isLoading && (
        <>
          <div className="persons-choices">
            <button
              type="button"
              className={people === 'known' ? 'focused' : ''}
              onClick={() => setPeople('known')}>
              {t('persons.choices.known')}
            </button>
            <button
              type="button"
              className={people === 'unknown' ? 'focused' : ''}
              onClick={() => setPeople('unknown')}>
              {t('persons.choices.unknown')}
            </button>
          </div>

          <div className="persons-cards">
            {personsData
              .filter((person) => {
                if (people === 'known') {
                  return person.registered;
                }
                return !person.registered;
              })
              .map((person) => (
                <Card size="large" key={`person-${person.id}`}>
                  <FontAwesomeIcon
                    className="delete-person"
                    icon={faTrashAlt}
                    onClick={() => {
                      setConfirm({
                        cancelHandler: () => setConfirm(undefined),
                        successHandler: async () => {
                          setConfirm(undefined);
                          setLoading(true);
                          const target = person.getPerson();
                          const { id } = target;
                          try {
                            await target.delete();
                            setPersonsData(
                              personsData.filter((data) => data.id !== id),
                            );
                          } catch (e) {
                            setError(e);
                          } finally {
                            setLoading(false);
                          }
                        },
                        message: t('persons.deleteConfirm'),
                      });
                    }}
                  />
                  <div className="persons-carousel">
                    <Gallery
                      images={person.images.map((image) => ({
                        src: image,
                        alt: 'Person',
                      }))}
                    />
                  </div>
                  {people === 'known' && (
                    <ul>
                      <li>
                        <strong>{t('persons.list.names')}:</strong>
                        {person.names}
                      </li>
                      <li>
                        <strong>{t('persons.list.surnames')}:</strong>
                        {person.surnames}
                      </li>
                    </ul>
                  )}
                  {people === 'unknown' && <h3>{t('persons.list.unknown')}</h3>}
                  <Button
                    theme="primary"
                    content={
                      people === 'unknown'
                        ? t('persons.buttons.register')
                        : t('persons.buttons.edit')
                    }
                    onClick={() => history.push(`/person/${person.id}`)}
                  />
                  <Button
                    theme="primary"
                    content={t('persons.buttons.detections')}
                    onClick={() => history.push(`/detection/${person.id}`)}
                  />
                </Card>
              ))}
            {people === 'known' && (
              <Button
                theme="primary"
                content={t('persons.buttons.create')}
                onClick={() => history.push('/person/new')}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Persons;
