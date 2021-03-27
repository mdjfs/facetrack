import { Snapshot } from 'node-onvif-ts';

import Auth from './auth';
import User from './user';

import * as config from '../config.json';
import Device, { DeviceT, RegisteredT } from './device';

const auth = new Auth();

interface CameraData {
  id: number;
  name: string;
}

class Camera {
  id: number;

  name: string;

  user: User;

  connectError: Error | undefined;

  device: RegisteredT | undefined;

  initialized = false;

  deviceController: Device;

  constructor(
    id: number | null = null,
    name: string | null = null,
    user: User | null = null,
  ) {
    this.user = user || auth.getUser();
    if (id) this.id = id;
    if (name) this.name = name;
    this.deviceController = new Device();
  }

  private loadDevice(): RegisteredT {
    const device = this.deviceController.getByCamera(this);
    if (device) return device;
    throw new Error('No device.');
  }

  getDevice(): RegisteredT {
    if (this.hasError()) return this.loadDevice();
    return this.device || this.loadDevice();
  }

  async connect(): Promise<void> {
    try {
      this.device = this.getDevice();
      const { device, profile } = this.device;
      await device.init();
      device.changeProfile(profile);
      this.connectError = undefined;
    } catch (e) {
      this.connectError = e as Error;
    } finally {
      this.initialized = true;
    }
    if (this.connectError) {
      throw this.connectError;
    }
  }

  isInitialized(): boolean {
    return this.initialized && !this.hasError();
  }

  hasError(): Error | undefined {
    return this.connectError;
  }

  async getSnapshot(): Promise<Snapshot> {
    let error: Error | undefined;
    let snap: Snapshot | undefined;
    try {
      const { device } = this.getDevice();
      snap = await device.fetchSnapshot();
    } catch (e) {
      this.connectError = e as Error;
      error = e as Error;
    }
    if (error) throw error;
    if (!snap) throw new Error('No snap.');
    else return snap;
  }

  async delete(): Promise<void> {
    const response = await fetch(`${config.API_URL}/cameras?id=${this.id}`, {
      headers: this.user.headers,
      method: 'DELETE',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    }
  }

  async create(name: string): Promise<Camera> {
    const response = await fetch(`${config.API_URL}/cameras`, {
      headers: this.user.headers,
      method: 'POST',
      body: JSON.stringify({
        name,
      }),
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: CameraData = (await response.json()) as CameraData;
      const camera = new Camera(json.id, json.name, this.user);
      return camera;
    }
  }

  async getAll(): Promise<Camera[]> {
    const response = await fetch(`${config.API_URL}/cameras`, {
      headers: this.user.headers,
      method: 'GET',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: CameraData[] = (await response.json()) as CameraData[];
      const cameras: Camera[] = [];
      for (const record of json) {
        const camera = new Camera(record.id, record.name, this.user);
        cameras.push(camera);
      }
      return cameras;
    }
  }
}

class DemoCamera extends Camera {
  constructor(device: DeviceT, user: string, pass: string) {
    super();
    const profile = device.device.getCurrentProfile();
    this.device = {
      ...device,
      user,
      pass,
      camera: this,
      profile: profile.token,
    };
  }
}

export { Camera, DemoCamera };
export default Camera;
