import Store from 'electron-store';
import * as initialConfig from '../config.json';

export { Config };

export interface InputVars {
  MAX_RECOGNITION_PER_PERSON?: number;
  MAX_MINUTES_TIMEOUT_PER_CAMERA?: number;
  MS_PER_PHOTO_CAMERA?: number;
  FACE_MIN_CONFIDENCE?: number;
  LANGUAGE?: 'en' | 'es';
}

export interface Vars {
  MAX_RECOGNITION_PER_PERSON: number;
  MAX_MINUTES_TIMEOUT_PER_CAMERA: number;
  MS_PER_PHOTO_CAMERA: number;
  FACE_MIN_CONFIDENCE: number;
  LANGUAGE: 'en' | 'es';
}

let configVars: Vars = initialConfig.vars as Vars;

export interface Validators {
  [key: string]: (value: unknown) => boolean;
}

const validators: Validators = {
  FACE_MIN_CONFIDENCE: (val: number) => val >= 0.1 && val <= 1,
  MS_PER_PHOTO_CAMERA: (val: number) => val >= 100 && val <= 5000,
  MAX_MINUTES_TIMEOUT_PER_CAMERA: (val: number) => val >= 1 && val <= 60,
  MAX_RECOGNITION_PER_PERSON: (val: number) => val >= 2 && val <= 6,
};

export default class Config {
  store = new Store();

  constructor() {
    const previousConfig = this.store.get('previous-config', false) as Vars;
    if (previousConfig) {
      configVars = previousConfig;
    }
  }

  set(config: InputVars): boolean {
    for (const entry of Object.entries(config)) {
      if (validators[entry[0]] && !validators[entry[0]](entry[1])) {
        return false;
      }
    }
    configVars = {
      ...configVars,
      ...config,
    };
    this.update();
    return true;
  }

  get(): Vars {
    return configVars;
  }

  private update() {
    this.store.set('previous-config', configVars);
  }
}
