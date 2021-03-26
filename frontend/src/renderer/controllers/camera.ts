import { Snapshot } from 'node-onvif-ts';

import Auth from './auth';
import User from './user';

import * as config from '../config.json';
import Device, { DeviceT, RegisteredT } from './device';

const auth = new Auth();
const deviceController = new Device();

interface CameraData {
  id: number;
  name: string;
}

class Camera {
  id: number;

  name: string;

  user: User;

  connectError: Error | null = null;

  device: RegisteredT | undefined;

  initialized = false;

  constructor(
    id: number | null = null,
    name: string | null = null,
    user: User | null = null,
  ) {
    this.user = user || auth.getUser();
    if (id) this.id = id;
    if (name) this.name = name;
  }

  private loadDevice(): RegisteredT {
    const device = deviceController.getByCamera(this);
    if (device) return device;
    throw new Error('No device.');
  }

  getDevice(): RegisteredT {
    return this.device || this.loadDevice();
  }

  async connect(): Promise<void> {
    this.device = this.getDevice();
    const { device } = this.device;
    try {
      await device.init();
      this.connectError = null;
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

  hasError(): Error | null {
    return this.connectError;
  }

  async getSnapshot(): Promise<Snapshot | undefined> {
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
    return snap;
  }

  async create(name: string): Promise<[Error | null, Camera | null]> {
    try {
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
        return [null, camera];
      }
    } catch (e) {
      return [e, null];
    }
  }

  async getAll(): Promise<[Error | null, Camera[] | null]> {
    try {
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
        return [null, cameras];
      }
    } catch (e) {
      return [e, null];
    }
  }
}

class DemoCamera extends Camera {
  constructor(device: DeviceT, user: string, pass: string) {
    super();
    this.device = {
      ...device,
      user,
      pass,
      camera: this,
    };
  }
}

export { Camera, DemoCamera };
export default Camera;
