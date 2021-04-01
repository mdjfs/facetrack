import { Auth } from './auth';
import { FaceT, Recognition } from './recognition';
import { User } from './user';
import * as config from '../config.json';
import { DetectionFetch, Detection } from './detection';
import { Camera } from './camera';

export interface PersonGeneralData {
  names: string;
  surnames: string;
  registered: boolean;
}

export interface PersonData extends PersonGeneralData {
  id: number;
}

export interface RegisteredFace extends FaceT {
  id: number;
}

const auth = new Auth();
const recognition = new Recognition();

export class Person {
  id: number;

  names: string;

  surnames: string;

  faces: RegisteredFace[] | undefined;

  user: User;

  maxRecognition: number;

  registered: boolean;

  charged = false;

  updatedFaces = false;

  constructor(
    data: PersonData | undefined = undefined,
    user: User | undefined = undefined,
  ) {
    this.user = user || auth.getUser();
    if (data) this.chargeData(data);
    this.maxRecognition = config.MAX_RECOGNITION_PER_PERSON;
  }

  private chargeData(data: PersonData) {
    const { id, names, surnames, registered } = data;
    this.id = id;
    this.names = names;
    this.surnames = surnames;
    this.registered = registered;
    this.charged = true;
  }

  private chargedData(): PersonData {
    return {
      id: this.id,
      names: this.names,
      surnames: this.surnames,
      registered: this.registered,
    };
  }

  async recognize(face: FaceT): Promise<boolean> {
    const faces = await this.getFaces();
    if (faces.length > 0) {
      let doNext = true;
      let i = 0;
      const facesIndex: number[] = [];
      do {
        let random = -1;
        do {
          random = Math.floor(Math.random() * faces.length);
        } while (facesIndex.includes(random));
        facesIndex.push(random);
        i += 1;
        if (i >= this.maxRecognition || i >= faces.length) doNext = false;
      } while (doNext);
      let matched = false;
      for (const index of facesIndex) {
        const input = faces[index];
        const match = await recognition.compareFaces(input, face);
        if (match.confidence >= 0.8) matched = true;
      }
      return matched;
    }
    return false;
  }

  private bufferToBlob(buffer: Buffer, mimetype: string): Blob {
    const blob: Blob = new Blob(
      [new Uint8Array(buffer, buffer.byteOffset, buffer.length)],
      { type: mimetype },
    );
    return blob;
  }

  async deleteFace(id: number): Promise<void> {
    const response = await fetch(`${config.API_URL}/face?id=${id}`, {
      headers: this.user.headers,
      method: 'DELETE',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    }

    this.updatedFaces = true;
  }

  async addFace(face: FaceT | FaceT[]): Promise<void> {
    const form = new FormData();
    const headers = new Headers();
    headers.set('Authorization', auth.getToken());
    if (Array.isArray(face)) {
      for (let i = 0; i < face.length; i += 1) {
        form.append(
          'photos',
          this.bufferToBlob(face[i].buffer, face[i].mimetype),
          'photo.jpg',
        );
      }
    } else {
      form.append(
        'photos',
        this.bufferToBlob(face.buffer, face.mimetype),
        'photo.jpg',
      );
    }
    const response = await fetch(`${config.API_URL}/face?personId=${this.id}`, {
      headers,
      method: 'POST',
      body: form,
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    }

    this.updatedFaces = true;
  }

  async getFaces(): Promise<FaceT[]> {
    if (this.updatedFaces || !this.faces) {
      const faces = await this.loadFaces();
      this.updatedFaces = false;
      return faces;
    }
    return this.faces;
  }

  async getDetections(): Promise<Detection[]> {
    const resp = await fetch(
      `${config.API_URL}/detections?personId=${this.id}`,
      {
        headers: this.user.headers,
        method: 'GET',
      },
    );
    if (resp.status !== 200) {
      const text = await resp.text();
      throw new Error(text);
    } else {
      const json: DetectionFetch[] = (await resp.json()) as DetectionFetch[];
      const detections: Detection[] = [];
      for (const detection of json) {
        const camera = new Camera(undefined, this.user);
        const person = new Person(undefined, this.user);
        const { id, since, until, cameraId, personId } = detection;
        camera.setId(cameraId);
        person.setId(personId);
        detections.push(
          new Detection(
            {
              id,
              since,
              until,
              camera,
              person,
            },
            this.user,
          ),
        );
      }
      return detections;
    }
  }

  private async loadFaces(): Promise<FaceT[]> {
    const response = await fetch(`${config.API_URL}/face?personId=${this.id}`, {
      headers: this.user.headers,
      method: 'GET',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const ids: number[] = (await response.json()) as number[];
      const faces: RegisteredFace[] = [];
      for (const id of ids) {
        const imageResponse = await fetch(`${config.API_URL}/face?id=${id}`, {
          headers: this.user.headers,
          method: 'GET',
        });
        if (imageResponse.status !== 200) {
          const text = await response.text();
          throw new Error(text);
        } else {
          const arrayBuffer: ArrayBuffer = await imageResponse.arrayBuffer();
          const buffer: Buffer = Buffer.from(arrayBuffer);
          const contentType = imageResponse.headers.get('Content-Type');
          if (contentType) {
            faces.push({
              id,
              buffer,
              mimetype: contentType.toString(),
            });
          } else throw new Error('No mimetype.');
        }
      }
      this.faces = faces;
      return faces;
    }
  }

  async delete(): Promise<void> {
    const response = await fetch(`${config.API_URL}/person?id=${this.id}`, {
      headers: this.user.headers,
      method: 'DELETE',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    }
  }

  async update(data: PersonGeneralData): Promise<void> {
    const response = await fetch(`${config.API_URL}/person?id=${this.id}`, {
      headers: this.user.headers,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    }
  }

  async create(data: PersonGeneralData): Promise<Person> {
    const response = await fetch(`${config.API_URL}/person`, {
      headers: this.user.headers,
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: PersonData = (await response.json()) as PersonData;
      const person = new Person(json, this.user);
      return person;
    }
  }

  async getAll(onlyRegistered = false): Promise<Person[]> {
    const response = await fetch(`${config.API_URL}/person`, {
      headers: this.user.headers,
      method: 'GET',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: PersonData[] = (await response.json()) as PersonData[];
      const persons: Person[] = [];
      const search: PersonData[] = onlyRegistered
        ? json.filter((person) => person.registered)
        : json;
      for (const record of search) {
        const person = new Person(record, this.user);
        persons.push(person);
      }
      return persons;
    }
  }

  async loadData(id: number): Promise<PersonData> {
    const response = await fetch(`${config.API_URL}/person?id=${id}`, {
      headers: this.user.headers,
      method: 'GET',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: PersonData = (await response.json()) as PersonData;
      this.chargeData(json);
      return json;
    }
  }

  setId(id: number): void {
    this.id = id;
  }

  async getData(): Promise<PersonData> {
    const data = this.charged
      ? this.chargedData()
      : await this.loadData(this.id);
    return data;
  }
}

export default Person;
