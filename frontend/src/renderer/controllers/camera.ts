import Auth from "./auth";
import User from "./user";

import * as config from "../config.json";
import Device from "./device";

const auth = new Auth();
const device = new Device();

class Camera {
  id: number;
  name: string;
  user: User;

  constructor(
    id: number | null = null,
    name: string | null = null,
    user: User | null = null
  ) {
    this.user = user ? user : auth.getUser();
    if (id) this.id = id;
    if (name) this.name = name;
  }

  getDevice() {
    return device.getByCamera(this);
  }

  async create(name: string): Promise<[Error | null, Camera | null]> {
    try {
      const response = await fetch(`${config.API_URL}/cameras`, {
        headers: this.user.headers,
        method: "POST",
        body: JSON.stringify({
          name: name,
        }),
      });
      if (response.status == 200) {
        const json = await response.json();
        const camera = new Camera(json.id, json.name, this.user);
        return [null, camera];
      } else {
        const text = await response.text();
        throw new Error(text);
      }
    } catch (e) {
      return [e, null];
    }
  }

  async getAll(): Promise<[Error | null, Camera[] | null]> {
    try {
      const response = await fetch(`${config.API_URL}/cameras`, {
        headers: this.user.headers,
        method: "GET",
      });
      if (response.status == 200) {
        const json = await response.json();
        const cameras: Camera[] = [];
        for (const record of json) {
          const camera = new Camera(record.id, record.name, this.user);
          cameras.push(camera);
        }
        return [null, cameras];
      } else {
        const text = await response.text();
        throw new Error(text);
      }
    } catch (e) {
      return [e, null];
    }
  }
}

export { Camera };
export default Camera;
