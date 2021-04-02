import { Auth } from './auth';
import { Camera } from './camera';
import { Person } from './person';
import { FaceT, Recognition } from './recognition';
import { User } from './user';
import * as config from '../config.json';
import Log from './log';
import Config from './config';

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

const auth = new Auth();
const configController = new Config();

export class Detection {
  id: number;

  camera: Camera;

  person: Person;

  since: Date;

  until: Date;

  user: User;

  charged = false;

  constructor(
    data: DetectionData | undefined = undefined,
    user: User | undefined = undefined,
  ) {
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

  async getByPerson(id: number): Promise<Detection[]> {
    const response = await fetch(
      `${config.API_URL}/detections?personId=${id}`,
      {
        headers: this.user.headers,
        method: 'GET',
      },
    );
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      // eslint-disable-next-line max-len
      const json: DetectionFetch[] = (await response.json()) as DetectionFetch[];
      const detections: Detection[] = [];
      for (const dataFetch of json) {
        const data: DetectionData = this.loadObject(dataFetch);
        const detection = new Detection(data, this.user);
        detections.push(detection);
      }
      return detections;
    }
  }

  async getByPage(page: number, size = 5): Promise<Detection[]> {
    const response = await fetch(
      `${config.API_URL}/detections?page=${page}&size=${size}`,
      {
        headers: this.user.headers,
        method: 'GET',
      },
    );
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      // eslint-disable-next-line max-len
      const json: DetectionFetch[] = (await response.json()) as DetectionFetch[];
      const detections: Detection[] = [];
      for (const dataFetch of json) {
        const data: DetectionData = this.loadObject(dataFetch);
        const detection = new Detection(data, this.user);
        detections.push(detection);
      }
      return detections;
    }
  }

  private loadObject(data: DetectionFetch): DetectionData {
    const camera = new Camera(undefined, this.user);
    const person = new Person(undefined, this.user);
    camera.setId(data.cameraId);
    person.setId(data.personId);
    return {
      camera,
      person,
      id: data.id,
      since: new Date(data.since),
      until: new Date(data.until),
    };
  }

  private async loadData(id: number): Promise<DetectionData> {
    const response = await fetch(`${config.API_URL}/detections?id=${id}`, {
      headers: this.user.headers,
      method: 'GET',
    });
    if (response.status !== 200) {
      const text = await response.text();
      throw new Error(text);
    } else {
      const json: DetectionFetch = (await response.json()) as DetectionFetch;
      const data: DetectionData = this.loadObject(json);
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

  status: 'stopped' | 'working' | 'unitialized' = 'unitialized';

  logs = new Log();

  recognition = new Recognition();

  constructor(user: User | undefined) {
    this.user = user || auth.getUser();
    this.personController = new Person(undefined, this.user);
    this.cameraController = new Camera(undefined, this.user);
    this.detectionController = new Detection(undefined, this.user);
    const vars = configController.get();
    this.maxMinutes = vars.MAX_MINUTES_TIMEOUT_PER_CAMERA;
    this.cameraDelay = vars.MS_PER_PHOTO_CAMERA;
  }

  async init(): Promise<void> {
    this.persons = await this.personController.getAll();
    this.cameras = await this.cameraController.getAll();
    for (const camera of this.cameras) {
      try {
        await camera.connect();
      } catch (e) {
        const error = e as Error;
        this.logs.send('connectError', {
          cameraId: camera.id,
          error: error.message,
        });
      }
    }
    await this.startWorker();
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
            const error = e as Error;
            this.logs.send('connectError', {
              cameraId: camera.id,
              error: error.message,
            });
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
        try {
          faces = await this.recognition.getFaces(
            photo.body,
            photo.headers['content-type'],
          );
        } catch (e) {
          const error = e as Error;
          this.logs.send('recognitionError', { error: error.message });
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
    this.logs.send('detectionFound', {
      cameraId: task.camera.id,
      personId: personFound.id,
    });
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
        this.logs.send('taskFound', { id: face.camera.id });
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
    this.status = 'working';
    this.logs.send('initWorker');
  }

  stopWorker(): void {
    this.stopped = true;
    this.status = 'stopped';
    this.logs.send('stopWorker');
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
