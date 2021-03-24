/* eslint-disable sort-imports */

import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./new.css";
import { Button, Card, ErrorBox, Input, Modal } from "_/renderer/components";
import {
  faChevronLeft,
  faPlusSquare,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { startProbe, OnvifDevice, Probe, Profile } from "node-onvif-ts";
import { useHistory, useParams } from "react-router";
import { DeviceT, Device } from "_/renderer/controllers/device";
import Camera from "_/renderer/controllers/camera";
import Select, { ValueType } from "react-select";

const { useState, useEffect } = React;
const deviceController = new Device();
const cameraController = new Camera();

interface NewDeviceProps {
  id: string;
}

interface ProfileT {
  profile: Profile;
  snapshot: Buffer;
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

function NewDevice({ id }: NewDeviceProps): JSX.Element {
  const { t } = useTranslation();

  const [profiles, setProfiles] = useState<ProfileT[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [device, setDevice] = useState<DeviceT>();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [camera, setCamera] = useState<CameraInfo | null>(null);
  const [newCamera, setNewCamera] = useState("");
  const [oldCamera, setOldCamera] = useState(0);

  const history = useHistory();

  if (!id) history.push("/detect");
  else id = unescape(id);

  async function linkDevice() {
    try {
      console.log(camera, newCamera, oldCamera);

      setLoading(true);
      if (camera) {
        let target: Camera | undefined = undefined;
        let replace = false;
        if (newCamera !== "") {
          const [error, camera] = await cameraController.create(newCamera);
          if (error) setError(error);
          else if (camera) {
            target = camera;
          }
        } else {
          target = camera.cameras.filter((value) => value.id == oldCamera)[0];
          replace = true;
        }
        if (target) {
          deviceController.register(
            device as DeviceT,
            camera.profile.token,
            target,
            user,
            pass,
            replace
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
      const [error, cameras] = await cameraController.getAll();
      if (error) setError(error);
      else if (cameras) {
        setCamera({
          profile: profile,
          device: device,
          cameras: cameras,
        });
      }
    }
    setLoading(false);
  }

  async function loadDevice(user: string, pass: string) {
    setLoading(true);
    if (device) {
      const receiver = device.device;
      receiver.setAuth(user, pass);
      let error = null;
      try {
        await receiver.init();
      } catch (e) {
        error = e;
      }
      if (error) setError(error);
      else {
        const profiles: ProfileT[] = [];
        for (const profile of receiver.getProfileList()) {
          receiver.changeProfile(profile.token);
          const snap = await receiver.fetchSnapshot();
          profiles.push({
            profile: profile,
            snapshot: snap.body,
          });
        }
        setProfiles(profiles);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    const device = deviceController.getDeviceById(id);
    if (!device) setError(new Error(t("error.NO_DEVICE")));
    else {
      setDevice(device);
    }
    setLoading(false);
  }, []);

  return (
    <React.Fragment>
      <FontAwesomeIcon
        icon={faChevronLeft}
        className="go-back"
        onClick={() => history.push("/detect")}
      ></FontAwesomeIcon>
      <div className="new-device-header">
        <h1>{t("newDevice.header")}</h1>
      </div>
      <div className="new-device-body">
        {isLoading && <FontAwesomeIcon icon={faSpinner} spin></FontAwesomeIcon>}
        {!isLoading && (
          <React.Fragment>
            {error && (
              <ErrorBox
                error={t("error.NO_PROFILES")}
                complete={error}
                exitHandler={() => setError(null)}
              />
            )}
            {profiles.length > 0 && (
              <React.Fragment>
                <h3>
                  {t("newDevice.profilesFound", { number: profiles.length })}
                  {profiles.map((profile, index) => {
                    const base64String = btoa(
                      String.fromCharCode(...new Uint8Array(profile.snapshot))
                    );
                    return (
                      <Card size="large" key={`profile-${index}`}>
                        <img
                          src={`data:image/png;base64,${base64String}`}
                          alt="Profile"
                          className="profile-image"
                        ></img>
                        <h3>{profile.profile.name}</h3>
                        <Button
                          content={t("newDevice.buttons.registerCamera")}
                          theme="primary"
                          onClick={() => loadCamera(profile.profile)}
                        ></Button>
                      </Card>
                    );
                  })}
                </h3>
              </React.Fragment>
            )}

            {camera && !camera.camera && !error && (
              <Modal exitHandler={() => setCamera(null)}>
                <div className="new-device-camera">
                  <Input
                    name={t("newDevice.inputs.camera.name")}
                    placeholder={t("newDevice.inputs.camera.placeholder")}
                    handler={(value: string) => setNewCamera(value)}
                  />
                  {camera.cameras.length > 0 && (
                    <React.Fragment>
                      <strong>{t("newDevice.createOr")}:</strong>
                      <Select
                        name={t("newDevice.createOr")}
                        options={(() => {
                          const options: CameraOptions[] = camera.cameras.map(
                            (value) => ({
                              value: value.id,
                              label: `${value.name} (id: ${value.id})`,
                            })
                          );
                          return options;
                        })()}
                        onChange={(camera) =>
                          setOldCamera((camera as CameraOptions).value)
                        }
                      />
                    </React.Fragment>
                  )}
                  <Button
                    theme="secondary"
                    content={t("newDevice.buttons.camera")}
                    onClick={() => linkDevice()}
                  />
                </div>
              </Modal>
            )}

            {profiles.length == 0 && !error && (
              <Modal exitHandler={() => history.push("/detect")}>
                <div className="new-device-auth">
                  <Input
                    name={t("newDevice.inputs.user.name")}
                    placeholder={t("newDevice.inputs.user.placeholder")}
                    handler={(value: string) => setUser(value)}
                  />
                  <Input
                    name={t("newDevice.inputs.pass.name")}
                    placeholder={t("newDevice.inputs.pass.placeholder")}
                    handler={(value: string) => setPass(value)}
                    password
                  />
                  <Button
                    theme="secondary"
                    content={t("newDevice.buttons.auth")}
                    onClick={() => loadDevice(user, pass)}
                  />
                </div>
              </Modal>
            )}
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

export default NewDevice;
