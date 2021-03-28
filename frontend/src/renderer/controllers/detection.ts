import { Auth } from './auth';
import { Camera } from './camera';
import { Person } from './person';
import { FaceT, Recognition } from './recognition';
import { User } from './user';
import * as config from '../config.json';

export interface DetectionGeneralData {
  camera: Camera;
  person: Person;
  since: Date;
  until: Date;
}

export interface DetectionFetch {
  id: number;
  cameraId: number;
  personId: number;
  since: Date;
  until: Date;
}

export interface DetectionCreate {
  cameraId: number;
  personId: number;
  since: Date;
  until: Date;
}

export interface DetectionData extends DetectionGeneralData {
  id: number;
}

const recognition = new Recognition();
const auth = new Auth();

export class Detection {
  id: number;

  camera: Camera;

  person: Person;

  since: Date;

  until: Date;

  user: User;

  charged = false;

  constructor(data: DetectionData | undefined, user: User | undefined) {
    this.user = user || auth.getUser();
    if (data) this.chargeData(data);
  }

  async create(data: DetectionCreate): Promise<Detection> {
    const response = await fetch(`${config.API_URL}/detections`, {
      headers: this.user.headers,
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: DetectionFetch = (await response.json()) as DetectionFetch;
      const camera = new Camera(undefined, this.user);
      const person = new Person(undefined, this.user);
      camera.setId(json.cameraId);
      person.setId(json.personId);
      const { id, since, until } = json;
      return new Detection(
        {
          id,
          since,
          until,
          camera,
          person,
        },
        this.user,
      );
    }
  }

  async update(until: Date): Promise<void> {
    const response = await fetch(`${config.API_URL}/detections`, {
      headers: this.user.headers,
      method: 'PUT',
      body: JSON.stringify({
        id: this.id,
        until,
      }),
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    }
  }

  private chargeData(data: DetectionData) {
    const { id, camera, person, since, until } = data;
    this.id = id;
    this.camera = camera;
    this.person = person;
    this.since = since;
    this.until = until;
    this.charged = true;
  }

  private chargedData(): DetectionData {
    return {
      id: this.id,
      camera: this.camera,
      person: this.person,
      since: this.since,
      until: this.until,
    };
  }

  setId(id: number): void {
    this.id = id;
  }

  private async loadData(id: number): Promise<DetectionData> {
    const response = await fetch(`${config.API_URL}/detections?id=${id}`, {
      headers: this.camera.user.headers,
      method: 'GET',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: DetectionFetch = (await response.json()) as DetectionFetch;
      const camera = new Camera(undefined, this.user);
      const person = new Person(undefined, this.user);
      camera.setId(json.cameraId);
      person.setId(json.personId);
      const data: DetectionData = {
        camera,
        person,
        id: json.id,
        since: json.since,
        until: json.until,
      };
      this.chargeData(data);
      return data;
    }
  }

  async getData(): Promise<DetectionData> {
    const data = this.charged
      ? this.chargedData()
      : await this.loadData(this.id);
    return data;
  }
}

interface FaceTask {
  camera: Camera;
  face: FaceT;
}

interface EndTask extends FaceTask {
  person: Person;
  date: Date;
  detection: Detection;
}

export class DetectionWorker {
  user: User;

  persons: Person[];

  cameras: Camera[];

  cameraController: Camera;

  personController: Person;

  maxMinutes: number;

  cameraDelay: number;

  faceTasks: FaceTask[] = [];

  endTasks: EndTask[] = [];

  detectionController: Detection;

  stopped = false;

  constructor(user: User | undefined) {
    this.user = user || auth.getUser();
    this.personController = new Person(undefined, this.user);
    this.cameraController = new Camera(undefined, this.user);
    this.detectionController = new Detection(undefined, this.user);
    if (config && config.MAX_MINUTES_TIMEOUT_PER_CAMERA) {
      this.maxMinutes = config.MAX_MINUTES_TIMEOUT_PER_CAMERA;
    } else {
      this.maxMinutes = 30;
    }
    if (config && config.MS_PER_PHOTO_CAMERA) {
      this.cameraDelay = config.MS_PER_PHOTO_CAMERA;
    } else {
      this.cameraDelay = 500;
    }
    void this.init();
  }

  async init(): Promise<void> {
    this.persons = await this.personController.getAll();
    this.cameras = await this.cameraController.getAll();
    for (const camera of this.cameras) {
      await camera.connect();
    }
    void this.startWorker();
  }

  async listenCamera(
    camera: Camera,
    msWait: number = this.cameraDelay,
  ): Promise<void> {
    if (!this.stopped) {
      if (camera.hasError()) {
        const reconnect = async () => {
          try {
            await camera.connect();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          } finally {
            await this.listenCamera(
              camera,
              msWait >= this.maxMinutes * 60000 ? msWait : msWait + 1000,
            );
          }
        };
        setTimeout(() => {
          void reconnect();
        }, msWait);
      } else {
        const photo = await camera.getSnapshot();
        let faces: FaceT[] = [];
        console.log('Scanning...');
        try {
          faces = await recognition.getFaces(
            photo.body,
            photo.headers['content-type'],
          );
        } catch (e) {
          const error = e as Error;
          console.log(`Scanning error: ${error.message}`);
        }
        for (const face of faces) {
          this.faceTasks.push({
            camera,
            face,
          });
        }
        setTimeout(() => {
          void this.listenCamera(camera, msWait);
        }, msWait);
      }
    }
  }

  async save(task: FaceTask, personFound: Person): Promise<void> {
    const now: Date = new Date();
    this.endTasks = this.endTasks.filter(
      (endTask) => now.getTime() - endTask.date.getTime() <= 5 * 60000,
    );
    const [personTask] = this.endTasks.filter(
      (endTask) => endTask.person.id === personFound.id,
    );
    console.log(personTask, personFound.id);
    if (personTask) {
      await personTask.detection.update(now);
    } else {
      await personFound.addFace(task.face);
      const detection = await this.detectionController.create({
        personId: personFound.id,
        cameraId: task.camera.id,
        since: now,
        until: now,
      });
      this.endTasks.push({
        ...task,
        person: personFound,
        detection,
        date: new Date(),
      });
    }
  }

  async detect(task: FaceTask): Promise<void> {
    let personFound: Person | undefined;
    for (const person of this.persons) {
      const isPerson = await person.recognize(task.face);
      if (isPerson) {
        personFound = person;
        break;
      }
    }
    if (!personFound) {
      personFound = await this.personController.create({
        names: 'unknown',
        surnames: 'unknown',
        registered: false,
      });
    }
    await this.save(task, personFound);
  }

  setTasks(tasks: FaceTask[]): void {
    this.faceTasks = tasks;
  }

  setEndTasks(tasks: EndTask[]): void {
    this.endTasks = tasks;
  }

  listenFaces(): void {
    if (!this.stopped) {
      if (this.faceTasks.length > 0) {
        const face = this.faceTasks.pop() as FaceTask;
        console.log(`New task in camera ${face.camera.id}`);
        this.detect(face).finally(() => {
          this.listenFaces();
        });
      } else {
        setTimeout(() => {
          this.listenFaces();
        }, this.cameraDelay);
      }
    }
  }

  async startWorker(): Promise<void> {
    for (const camera of this.cameras) {
      await this.listenCamera(camera);
    }
    this.listenFaces();
  }

  stopWorker(): void {
    this.stopped = true;
  }

  restartWorker(keepTask = true): DetectionWorker {
    this.stopWorker();
    const worker = new DetectionWorker(this.user);
    if (keepTask) {
      worker.setEndTasks(this.endTasks);
      worker.setTasks(this.faceTasks);
    }
    return worker;
  }
}

export default Detection;
