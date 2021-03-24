import { OnvifDevice, Probe, startProbe } from "node-onvif-ts";
import Camera from "./camera";
import Store from "./store";

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
    const devices = this.store.get("devices-recorded") as DeviceT[];
    const registered = this.store.get("devices-registered") as RegisteredT[];
    this.devices = devices ? devices : [];
    this.devicesRegistered = registered ? registered : [];
    this.chargeDevice(this.devices);
    this.chargeRegistered(this.devicesRegistered);
  }

  private chargeDevice(device: DeviceT | DeviceT[]) {
    let charge = (device: DeviceT) =>
      (device.device = new OnvifDevice({ xaddr: device.probe.xaddrs[0] }));
    if (Array.isArray(device)) for (const item of device) charge(item);
    else charge(device);
  }

  private chargeRegistered(device: RegisteredT | RegisteredT[]) {
    let charge = (device: RegisteredT) => {
      device.device = new OnvifDevice({
        xaddr: device.probe.xaddrs[0],
        user: device.user,
        pass: device.pass,
      });
    };
    if (Array.isArray(device)) for (const item of device) charge(item);
    else charge(device);
  }

  add(device: DeviceT | DeviceT[]) {
    const addDevice = (device: DeviceT) => {
      const ids = this.devices.map((device: DeviceT) => device.probe.urn);
      if (!ids.includes(device.probe.urn)) {
        this.devices.push(device);
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
      probe: probe,
      device: new OnvifDevice({ xaddr: probe.xaddrs[0] }),
    }));
    this.add(devices);
    return devices;
  }

  async refresh() {
    const probes = await startProbe();
    const probesId = probes.map((probe) => probe.urn);
    this.devices = this.devices.filter((device) =>
      probesId.includes(device.probe.urn)
    );
    this.devicesRegistered = this.devicesRegistered.filter((device) =>
      probesId.includes(device.probe.urn)
    );
    this.updateDevices();
  }

  removeByCamera(camera: Camera) {
    this.devicesRegistered = this.devicesRegistered.filter(
      (device) => device.camera.id !== camera.id
    );
    this.updateDevices();
  }

  getByCamera(camera: Camera): RegisteredT | null {
    const device = this.devicesRegistered.filter(
      (device) => device.camera.id === camera.id
    );
    return device.length > 0 ? device[0] : null;
  }

  register(
    device: DeviceT | string,
    profile: string | number,
    camera: Camera,
    user: string,
    pass: string,
    replace: Boolean = false
  ) {
    if (typeof device == "string") {
      const found = this.getDeviceById(device);
      if (!found) throw new Error("No device");
      else device = found;
    }
    const changedProfile = device.device.changeProfile(profile);
    if (!changedProfile) throw new Error("No profile");

    if (replace) {
      this.removeByCamera(camera);
    }

    const ids = this.devicesRegistered.map((device) => device.camera.id);
    if (!ids.includes(camera.id)) {
      this.devicesRegistered.push({
        ...device,
        camera: camera,
        user: user,
        pass: pass,
      });
      this.updateDevices();
    } else throw new Error("Camera already occuped.");
  }

  updateDevices() {
    this.store.set("devices-recorded", this.devices);
    this.store.set("devices-registered", this.devicesRegistered);
  }

  getDeviceById(id: string): DeviceT | null {
    const device = this.devices.filter((value) => value.probe.urn === id);
    return device.length > 0 ? device[0] : null;
  }

  getDevices(): DeviceT[] {
    return this.devices;
  }
}

export { DeviceT, Device };
export default Device;
