import Store from 'electron-store';
import { OnvifDevice, Probe, startProbe } from 'node-onvif-ts';
import { Camera } from './camera';

interface DeviceT {
  probe: Probe;
  device: OnvifDevice;
}

interface RegisteredT extends DeviceT {
  camera: Camera;
  user: string;
  pass: string;
  profile: string | number;
}

class Device {
  store = new Store();

  devices: DeviceT[];

  devicesRegistered: RegisteredT[];

  constructor() {
    this.store.reset();
    const devices = this.store.get('devices-recorded', false);
    const registered = this.store.get('devices-registered', false);
    this.devices = this.chargeDevice((devices as DeviceT[]) || []);
    this.devicesRegistered = this.chargeRegistered(
      (registered as RegisteredT[]) || [],
    );
  }

  private chargeDevice(device: DeviceT | DeviceT[]): DeviceT[] {
    const charge = (item: DeviceT): DeviceT => ({
      ...item,
      device: new OnvifDevice({ xaddr: item.probe.xaddrs[0] }),
    });
    if (Array.isArray(device)) {
      return device.map((item) => charge(item));
    }
    return [charge(device)];
  }

  private chargeRegistered(device: RegisteredT | RegisteredT[]): RegisteredT[] {
    const charge = (item: RegisteredT): RegisteredT => ({
      ...item,
      device: new OnvifDevice({
        xaddr: item.probe.xaddrs[0],
        user: item.user,
        pass: item.pass,
      }),
    });
    if (Array.isArray(device)) {
      return device.map((item) => charge(item));
    }
    return [charge(device)];
  }

  async scan(): Promise<DeviceT[]> {
    const probes = await startProbe();
    const devices: DeviceT[] = probes.map((probe) => ({
      probe,
      device: new OnvifDevice({ xaddr: probe.xaddrs[0] }),
    }));
    this.devices = devices;
    this.updateDevices();
    return devices;
  }

  async refresh(): Promise<void> {
    const devices = await this.scan();
    for (let i = 0; i < this.devicesRegistered.length; i += 1) {
      for (const device of devices) {
        const registered = this.devicesRegistered[i];
        if (registered.probe.urn === device.probe.urn) {
          this.devicesRegistered[i] = {
            ...registered,
            device: new OnvifDevice({
              xaddr: device.probe.xaddrs[0],
              user: registered.user,
              pass: registered.pass,
            }),
            probe: device.probe,
          };
        }
      }
    }
    this.updateDevices();
  }

  removeByCamera(camera: Camera): void {
    this.devicesRegistered = this.devicesRegistered.filter(
      (item) => item.camera.id !== camera.id,
    );
    this.updateDevices();
  }

  getByCamera(camera: Camera): RegisteredT | undefined {
    const device = this.devicesRegistered.filter(
      (item) => item.camera.id === camera.id,
    );
    if (device.length > 0) {
      const [charged] = this.chargeRegistered(device);
      return charged;
    }
    return undefined;
  }

  register(
    device: DeviceT | string,
    profile: string | number,
    camera: Camera,
    user: string,
    pass: string,
    replace = false,
  ): void {
    if (typeof device === 'string') {
      const found = this.getDeviceById(device);
      if (!found) throw new Error('No device');
      // eslint-disable-next-line no-param-reassign
      else device = found;
    }
    const changedProfile = device.device.changeProfile(profile);
    if (!changedProfile) throw new Error('No profile');

    if (replace) {
      this.removeByCamera(camera);
    }

    const ids = this.devicesRegistered.map((item) => item.camera.id);
    if (!ids.includes(camera.id)) {
      this.devicesRegistered.push({
        ...device,
        camera,
        user,
        pass,
        profile,
      });
      this.updateDevices();
    } else throw new Error('Camera already occuped.');
  }

  updateDevices(): void {
    this.store.set('devices-recorded', []);
    this.store.set('devices-registered', []);
    this.store.set('devices-recorded', this.devices);
    this.store.set('devices-registered', this.devicesRegistered);

    const one = this.store.get('devices-recorded', false);
    const two = this.store.get('devices-registered', false);
    console.log(one, this.devices);
  }

  getDeviceById(id: string): DeviceT | undefined {
    const [device] = this.devices
      .filter((value) => value.probe.urn === id)
      .slice();
    return device;
  }

  getDevices(): DeviceT[] {
    return this.devices;
  }
}

export { DeviceT, Device, RegisteredT };
export default Device;
