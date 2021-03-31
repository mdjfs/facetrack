import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cancelable, CancelablePromiseType } from 'cancelable-promise';
import toBuffer from 'typedarray-to-buffer';
import {
  Button,
  Card,
  Confirm,
  ConfirmProps,
  ErrorBox,
  ImagePicker,
  Input,
  Modal,
  Nav,
  PickImage,
} from '_/renderer/components';
import Person from '_/renderer/controllers/person';
import './person.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faPlusSquare,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import Recognition, { FaceT } from '_/renderer/controllers/recognition';
import { useHistory } from 'react-router';

const { useState, useEffect, useRef } = React;

interface DetailProps {
  id: number;
}

interface newPersonProps {
  new: boolean;
}

const recognition = new Recognition();

function PersonDetail(props: DetailProps | newPersonProps): JSX.Element {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);
  const [person, setPerson] = useState<Person>();
  const [error, setError] = useState<Error>();
  const [confirm, setConfirm] = useState<ConfirmProps>();
  const [selectFaces, setFaces] = useState<FaceT[]>();
  const [selectedFaces, setSelected] = useState<FaceT[]>();
  const [names, setNames] = useState<string>();
  const [surnames, setSurnames] = useState<string>();
  const [initialName, setInitialName] = useState<string>();
  const [initialSurname, setInitialSurname] = useState<string>();

  function bufferToUrl(buffer: Buffer, mimetype = 'image/jpeg'): string {
    const base64 = btoa(
      new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    return `data:${mimetype};base64,${base64}`;
  }

  async function addFaces() {
    setLoading(true);
    try {
      if (!person) throw new Error('no person.');
      if (!selectedFaces) throw new Error('no faces.');
      await person.addFace(selectedFaces);
      await person.getFaces();
      setSelected(undefined);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadFile(file: File) {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const faces = await recognition.getFaces(buffer, file.type);
      if (faces.length === 0) throw new Error('no faces.');
      if (!person) throw new Error('no person.');
      if (faces.length === 1) {
        setSelected(faces);
        await addFaces();
      } else {
        setFaces(faces);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function deleteFace(id: number) {
    setLoading(true);
    try {
      if (!person) throw new Error('no person.');
      await person.deleteFace(id);
      await person.getFaces();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadPerson(id: number) {
    setLoading(true);
    try {
      const target = new Person();
      target.setId(id);
      await target.getData();
      await target.getFaces();
      if (target.registered) {
        setInitialName(target.names);
        setInitialSurname(target.surnames);
      }
      setPerson(target);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function createPerson() {
    setLoading(true);
    try {
      const controller = new Person();
      if (!names || !surnames) throw new Error('No names and surnames.');
      const newPerson = await controller.create({
        names,
        surnames,
        registered: true,
      });
      await loadPerson(newPerson.id);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function update() {
    setLoading(true);
    try {
      if (!person) throw new Error('no person.');
      const name = names || initialName;
      const surname = surnames || initialSurname;
      await person.update({
        names: name as string,
        surnames: surname as string,
        registered: true,
      });
      await loadPerson(person.id);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const detail = props as DetailProps;
    if (detail.id) {
      const promise: CancelablePromiseType<void> = cancelable(
        loadPerson(detail.id),
      );
      return () => {
        promise.cancel();
      };
    }
    return undefined;
  }, []);

  return (
    <>
      <Nav />
      <div className="person-detail-header">
        <Input
          name={t('personDetail.names')}
          placeholder={t('personDetail.names')}
          handler={(value: string) => setNames(value)}
          invisible
          defaultContent={names ? undefined : initialName}
        />
        <Input
          name={t('personDetail.surnames')}
          placeholder={t('personDetail.surnames')}
          handler={(value: string) => setSurnames(value)}
          invisible
          defaultContent={surnames ? undefined : initialSurname}
        />
      </div>

      {error && (
        <ErrorBox
          error={t('error.FAILED_LOADING_PERSON_DETAIL')}
          complete={error}
          exitHandler={() => setError(undefined)}
          className="error-loading-cameras"
        />
      )}

      {selectFaces && (
        <Modal exitHandler={() => setFaces(undefined)} className="faces-modal">
          <h1>{t('personDetail.selectFace')}</h1>
          <ImagePicker
            images={selectFaces.map((face) => ({
              src: bufferToUrl(face.buffer, face.mimetype),
              data: face,
            }))}
            multiple
            handler={(images: PickImage[]) => {
              setSelected(
                images.map((image) => {
                  const face = image.data as FaceT;
                  return face;
                }),
              );
            }}
          />
          <Button
            theme="secondary"
            content="Load images"
            onClick={async () => {
              setFaces(undefined);
              await addFaces();
            }}
          />
        </Modal>
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
          {person && (
            <>
              <div className="person-faces">
                {person.faces &&
                  person.faces.map((face) => (
                    <Card>
                      <FontAwesomeIcon
                        className="delete-face"
                        icon={faTimesCircle}
                        onClick={() => {
                          setConfirm({
                            message: t('personDetail.deleteFace'),
                            cancelHandler: () => {
                              setConfirm(undefined);
                            },
                            successHandler: async () => {
                              setConfirm(undefined);
                              await deleteFace(face.id);
                            },
                          });
                        }}
                      />
                      <img
                        src={bufferToUrl(face.buffer, face.mimetype)}
                        alt="Face"
                      />
                    </Card>
                  ))}
                <Card>
                  <FontAwesomeIcon
                    className="app-card-add"
                    icon={faPlusSquare}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');
                      input.onchange = async (e: InputEvent) => {
                        const element = e.target as HTMLInputElement;
                        if (element.files && element.files.length > 0) {
                          await loadFile(element.files[0]);
                        } else {
                          setError(new Error('No files'));
                        }
                      };
                      input.click();
                    }}
                  />
                </Card>
              </div>
              <div className="button-container">
                {names && surnames && !person.registered && (
                  <Button
                    content="register person"
                    theme="secondary"
                    onClick={async () => {
                      await update();
                    }}
                  />
                )}
                {((names !== initialName && names) ||
                  (surnames !== initialSurname && surnames)) &&
                  person.registered && (
                    <Button
                      content="update person"
                      theme="secondary"
                      onClick={async () => {
                        await update();
                      }}
                    />
                  )}
              </div>
            </>
          )}
          {!person && names && surnames && (
            <div className="button-container">
              <Button
                content="add person"
                theme="secondary"
                onClick={async () => {
                  await createPerson();
                }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

export default PersonDetail;
