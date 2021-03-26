import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './new.css';
import {
  Button,
  Card,
  ErrorBox,
  Input,
  Modal,
  Stream,
} from '_/renderer/components';
import {
  faChevronLeft,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { OnvifDevice, Profile } from 'node-onvif-ts';
import { useHistory } from 'react-router';
import { DeviceT, Device } from '_/renderer/controllers/device';
import { Camera, DemoCamera } from '_/renderer/controllers/camera';
import Select from 'react-select';

const { useState, useEffect } = React;
const deviceController = new Device();
const cameraController = new Camera();

interface NewDeviceProps {
  paramId: string;
}

interface ProfileT {
  profile: Profile;
  demoCamera: Camera;
}

interface CameraInfo {
  device: DeviceT;
  profile: Profile;
  camera?: Camera;
  cameras: Camera[];
}

type CameraOptions = {
  label: string;
  value: number;
};

function NewDevice({ paramId }: NewDeviceProps): JSX.Element {
  const { t } = useTranslation();

  const [profiles, setProfiles] = useState<ProfileT[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [device, setDevice] = useState<DeviceT>();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [camera, setCamera] = useState<CameraInfo | null>(null);
  const [newCamera, setNewCamera] = useState('');
  const [oldCamera, setOldCamera] = useState(0);

  const history = useHistory();

  let id: string;

  if (!paramId) history.push('/detect');
  else id = unescape(paramId);

  async function linkDevice() {
    try {
      setLoading(true);
      if (camera) {
        let target: Camera | undefined;
        let replace = false;
        if (newCamera !== '') {
          const [linkError, linkCamera] = await cameraController.create(
            newCamera,
          );
          if (linkError) setError(linkError);
          else if (linkCamera) {
            target = linkCamera;
          }
        } else {
          [target] = camera.cameras.filter((value) => value.id === oldCamera);
          replace = true;
        }
        if (target) {
          deviceController.register(
            device as DeviceT,
            camera.profile.token,
            target,
            user,
            pass,
            replace,
          );
          setCamera(null);
        }
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadCamera(profile: Profile) {
    setLoading(true);
    if (device) {
      const [loadError, loadCameras] = await cameraController.getAll();
      if (error) setError(loadError);
      else if (loadCameras) {
        setCamera({
          profile,
          device,
          cameras: loadCameras,
        });
      }
    }
    setLoading(false);
  }

  async function getDevice(index: string | number): Promise<DeviceT | null> {
    if (device) {
      const onvif = new OnvifDevice({
        xaddr: device?.probe.xaddrs[0],
        user,
        pass,
      });
      await onvif.init();
      onvif.changeProfile(index);
      return {
        ...device,
        device: onvif,
      };
    }
    return null;
  }

  async function loadDevice() {
    setLoading(true);
    if (device) {
      const receiver = device.device;
      receiver.setAuth(user, pass);
      try {
        await receiver.init();
        const loadProfiles: ProfileT[] = [];
        const loadProfileList = receiver.getProfileList();
        for (const profile of loadProfileList) {
          const demoDevice = await getDevice(profile.token);
          if (demoDevice) {
            loadProfiles.push({
              profile,
              demoCamera: new DemoCamera(demoDevice, user, pass),
            });
          }
        }
        setProfiles(loadProfiles);
      } catch (e) {
        setError(e);
      }
    } else {
      setError(new Error(t('error.NO_DEVICE')));
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    const foundDevice = deviceController.getDeviceById(id);
    if (!foundDevice) history.push('/detect');
    else setDevice(foundDevice);
    setLoading(false);
  }, []);

  return (
    <>
      <FontAwesomeIcon
        icon={faChevronLeft}
        className="go-back"
        onClick={() => history.push('/detect')}
      />
      <div className="new-device-header">
        <h1>{t('newDevice.header')}</h1>
      </div>
      <div className="new-device-body">
        {isLoading && (
          <FontAwesomeIcon
            className="new-device-loading"
            icon={faCircleNotch}
            spin
          />
        )}
        {!isLoading && (
          <>
            {error && (
              <ErrorBox
                error={t('error.NO_PROFILES')}
                complete={error}
                exitHandler={() => setError(null)}
              />
            )}
            {profiles.length > 0 && (
              <>
                <h3>
                  {t('newDevice.profilesFound', { number: profiles.length })}
                </h3>
                {profiles.map((profile) => (
                  <Card size="large" key={`profile-${profile.profile.token}`}>
                    <Stream
                      className="profile-stream"
                      camera={profile.demoCamera}
                    />
                    <h3>{profile.profile.name}</h3>
                    <Button
                      content={t('newDevice.buttons.registerCamera')}
                      theme="primary"
                      onClick={() => loadCamera(profile.profile)}
                    />
                  </Card>
                ))}
              </>
            )}

            {camera && !camera.camera && !error && (
              <Modal exitHandler={() => setCamera(null)}>
                <div className="new-device-camera">
                  <Input
                    name={t('newDevice.inputs.camera.name')}
                    placeholder={t('newDevice.inputs.camera.placeholder')}
                    handler={(value: string) => setNewCamera(value)}
                  />
                  {camera.cameras.length > 0 && (
                    <>
                      <Select
                        name={t('newDevice.createOr')}
                        options={(() => {
                          const options: CameraOptions[] = camera.cameras.map(
                            (value) => ({
                              value: value.id,
                              label: `${value.name} (id: ${value.id})`,
                            }),
                          );
                          return options;
                        })()}
                        onChange={(selectCamera) => {
                          setOldCamera((selectCamera as CameraOptions).value);
                        }}
                      />
                    </>
                  )}
                  <Button
                    theme="secondary"
                    content={t('newDevice.buttons.camera')}
                    onClick={() => linkDevice()}
                  />
                </div>
              </Modal>
            )}

            {profiles.length === 0 && !error && (
              <Modal exitHandler={() => history.push('/detect')}>
                <div className="new-device-auth">
                  <Input
                    name={t('newDevice.inputs.user.name')}
                    placeholder={t('newDevice.inputs.user.placeholder')}
                    handler={(value: string) => setUser(value)}
                  />
                  <Input
                    name={t('newDevice.inputs.pass.name')}
                    placeholder={t('newDevice.inputs.pass.placeholder')}
                    handler={(value: string) => setPass(value)}
                    password
                  />
                  <Button
                    theme="secondary"
                    content={t('newDevice.buttons.auth')}
                    onClick={() => loadDevice()}
                  />
                </div>
              </Modal>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default NewDevice;
