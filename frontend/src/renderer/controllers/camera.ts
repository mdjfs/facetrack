import { Snapshot } from 'node-onvif-ts';

import * as config from '../config.json';
import Auth from './auth';
import { User } from './user';
import { DeviceT, RegisteredT, Device } from './device';
import { restartWorker } from '../renderer';

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

  charged = false;

  hasRefresh = false;

  constructor(
    data: CameraData | undefined = undefined,
    user: User | undefined = undefined,
  ) {
    this.user = user || auth.getUser();
    if (data) this.chargeData(data);
    this.deviceController = new Device();
  }

  private async loadDevice(): Promise<RegisteredT> {
    if (!this.hasRefresh) {
      await this.deviceController.refresh();
      this.hasRefresh = true;
    }
    const device = this.deviceController.getByCamera(this);
    if (device) return device;
    throw new Error('No device.');
  }

  async getDevice(): Promise<RegisteredT> {
    if (this.hasError()) {
      const device = await this.loadDevice();
      return device;
    }
    return this.device || this.loadDevice();
  }

  async connect(): Promise<void> {
    try {
      this.device = await this.getDevice();
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
      const { device } = await this.getDevice();
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
    await restartWorker();
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
      const camera = new Camera(json, this.user);
      await restartWorker();
      return camera;
    }
  }

  private chargeData(data: CameraData): void {
    const { id, name } = data;
    this.id = id;
    this.name = name;
    this.charged = true;
  }

  private chargedData(): CameraData {
    return {
      id: this.id,
      name: this.name,
    };
  }

  private async loadData(id: number): Promise<CameraData> {
    const response = await fetch(`${config.API_URL}/cameras?id=${id}`, {
      headers: this.user.headers,
      method: 'GET',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: CameraData = (await response.json()) as CameraData;
      this.chargeData(json);
      return json;
    }
  }

  setId(id: number): void {
    this.id = id;
  }

  async getData(): Promise<CameraData> {
    const data = this.charged
      ? this.chargedData()
      : await this.loadData(this.id);
    return data;
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
        const camera = new Camera(record, this.user);
        cameras.push(camera);
      }
      return cameras;
    }
  }
}

class DemoCamera extends Camera {
  constructor(device: DeviceT, user: string, pass: string) {
    super(undefined, undefined);
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
