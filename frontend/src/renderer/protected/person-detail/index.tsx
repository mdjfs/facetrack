import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cancelable, CancelablePromiseType } from 'cancelable-promise';
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
import { bufferToUrl } from '../../utils';

interface DetailProps {
  id: number;
}

interface newPersonProps {
  new: boolean;
}

const { useState, useEffect, useRef } = React;

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
  const fileRef = useRef<HTMLInputElement>(null);

  const recognition = new Recognition();

  async function process(processAsync: () => Promise<void>): Promise<void> {
    setLoading(true);
    try {
      await processAsync();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function addFaces(faces: FaceT[] | undefined = undefined) {
    await process(async () => {
      if (!person) throw new Error('no person.');
      if (!selectedFaces && !faces) throw new Error('no faces.');
      await person.addFace((selectedFaces || faces) as FaceT[]);
      await person.getFaces();
      setSelected(undefined);
    });
  }

  async function loadFile(file: File) {
    await process(async () => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const faces = await recognition.getFaces(buffer, file.type);
      if (faces.length === 0) throw new Error('no faces.');
      if (!person) throw new Error('no person.');
      if (faces.length === 1) {
        await addFaces(faces);
      } else {
        setFaces(faces);
      }
    });
  }

  async function deleteFace(id: number) {
    await process(async () => {
      if (!person) throw new Error('no person.');
      await person.deleteFace(id);
      await person.getFaces();
    });
  }

  async function load(id: number) {
    await process(async () => {
      const target = new Person();
      target.setId(id);
      await target.getData();
      await target.getFaces();
      if (target.registered) {
        setNames(target.names);
        setSurnames(target.surnames);
      }
      setPerson(target);
    });
  }

  async function create() {
    await process(async () => {
      const controller = new Person();
      if (!names || !surnames) throw new Error('No names and surnames.');
      const newPerson = await controller.create({
        names,
        surnames,
        registered: true,
      });
      await load(newPerson.id);
    });
  }

  async function update() {
    await process(async () => {
      if (!person) throw new Error('no person.');
      if (!names || !surnames) throw new Error('No names and surnames.');
      await person.update({
        names,
        surnames,
        registered: true,
      });
      await load(person.id);
    });
  }

  useEffect(() => {
    const detail = props as DetailProps;
    if (detail.id) {
      const promise: CancelablePromiseType<void> = cancelable(
        process(async () => {
          await load(detail.id);
        }),
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
          name={names || t('personDetail.names')}
          placeholder={names || t('personDetail.names')}
          handler={(value: string) => setNames(value)}
          invisible
        />
        <Input
          name={surnames || t('personDetail.surnames')}
          placeholder={surnames || t('personDetail.surnames')}
          handler={(value: string) => setSurnames(value)}
          invisible
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
          <h1>{t('personDetail.selectFaces')}</h1>
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
            content={t('personDetail.buttons.loadFaces')}
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const element = e.target as HTMLInputElement;
                      if (element.files && element.files.length > 0) {
                        await loadFile(element.files[0]);
                      } else {
                        setError(new Error('No files'));
                      }
                    }}
                    hidden
                    ref={fileRef}
                  />
                  <FontAwesomeIcon
                    className="app-card-add"
                    icon={faPlusSquare}
                    onClick={() => {
                      if (fileRef.current) {
                        fileRef.current.click();
                      }
                    }}
                  />
                </Card>
              </div>
              <div className="button-container">
                {names && surnames && !person.registered && (
                  <Button
                    content={t('personDetail.buttons.register')}
                    theme="secondary"
                    onClick={async () => {
                      await update();
                    }}
                  />
                )}
                {names &&
                  surnames &&
                  (names !== person.names || surnames !== person.surnames) &&
                  person.registered && (
                    <Button
                      content={t('personDetail.buttons.update')}
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
                content={t('personDetail.buttons.add')}
                theme="secondary"
                onClick={async () => {
                  await create();
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
