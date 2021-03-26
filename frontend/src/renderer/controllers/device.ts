import { OnvifDevice, Probe, startProbe } from 'node-onvif-ts';
import Camera from './camera';
import Store from './store';

interface DeviceT {
  probe: Probe;
  device: OnvifDevice;
}

interface RegisteredT extends DeviceT {
  camera: Camera;
  user: string;
  pass: string;
}

class Device {
  store = Store;

  devices: DeviceT[];

  devicesRegistered: RegisteredT[];

  constructor() {
    const devices = this.store.get('devices-recorded') as DeviceT[];
    const registered = this.store.get('devices-registered') as RegisteredT[];
    this.devices = this.chargeDevice(devices || []);
    this.devicesRegistered = this.chargeRegistered(registered || []);
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

  add(device: DeviceT | DeviceT[]): void {
    const ids = this.devices.map((item: DeviceT) => item.probe.urn);
    const addDevice = (item: DeviceT) => {
      if (!ids.includes(item.probe.urn)) {
        this.devices.push(item);
      }
    };
    if (Array.isArray(device)) {
      for (const item of device) addDevice(item);
    } else addDevice(device);
    this.updateDevices();
  }

  async scan(): Promise<DeviceT[]> {
    const probes = await startProbe();
    const devices: DeviceT[] = probes.map((probe) => ({
      probe,
      device: new OnvifDevice({ xaddr: probe.xaddrs[0] }),
    }));
    this.add(devices);
    return devices;
  }

  async refresh(): Promise<void> {
    const probes = await startProbe();
    const probesId = probes.map((probe) => probe.urn);
    this.devices = this.devices.filter((device) => {
      const hasDevice = probesId.includes(device.probe.urn);
      return hasDevice;
    });
    this.updateDevices();
  }

  removeByCamera(camera: Camera): void {
    this.devicesRegistered = this.devicesRegistered.filter(
      (item) => item.camera.id !== camera.id,
    );
    this.updateDevices();
  }

  getByCamera(camera: Camera): RegisteredT | null {
    const device = this.devicesRegistered.filter(
      (item) => item.camera.id === camera.id,
    );
    if (device.length > 0) {
      const [charged] = this.chargeRegistered(device);
      return charged;
    }
    return null;
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
      });
      this.updateDevices();
    } else throw new Error('Camera already occuped.');
  }

  updateDevices(): void {
    this.store.set('devices-recorded', this.devices);
    this.store.set('devices-registered', this.devicesRegistered);
  }

  getDeviceById(id: string): DeviceT | null {
    const device = this.devices.filter((value) => value.probe.urn === id);
    return device.length > 0 ? device[0] : null;
  }

  getDevices(): DeviceT[] {
    return this.devices;
  }
}

export { DeviceT, Device, RegisteredT };
export default Device;
