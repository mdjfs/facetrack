import Store from 'electron-store';
import * as config from '../config.json';
import { User } from './user';

export interface RegisterState {
  names: string;
  surnames: string;
  email: string;
  password: string;
  username: string;
}

export type RegisterAction =
  | { type: 'setNames'; payload: string }
  | { type: 'setSurnames'; payload: string }
  | { type: 'setEmail'; payload: string }
  | { type: 'setPassword'; payload: string }
  | { type: 'setUsername'; payload: string };

export interface LoginState {
  email?: string;
  username?: string;
  password: string;
}

export type LoginAction =
  | { type: 'setEmail'; payload: string }
  | { type: 'setPassword'; payload: string }
  | { type: 'setUsername'; payload: string };

export { Auth };

const mainStore = new Store();

export default class Auth {
  store = mainStore;

  headers: Headers;

  constructor() {
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
  }

  getLoginReducer() {
    return (state: LoginState, { type, payload }: LoginAction): LoginState => {
      switch (type) {
        case 'setEmail':
          return {
            ...state,
            email: payload,
            username: undefined,
          };
        case 'setUsername':
          return {
            ...state,
            username: payload,
            email: undefined,
          };
        case 'setPassword':
          return {
            ...state,
            password: payload,
          };
        default:
          return state;
      }
    };
  }

  getRegisterReducer() {
    return (
      state: RegisterState,
      { type, payload }: RegisterAction,
    ): RegisterState => {
      switch (type) {
        case 'setEmail':
          return {
            ...state,
            email: payload,
          };
        case 'setNames':
          return {
            ...state,
            names: payload,
          };
        case 'setSurnames':
          return {
            ...state,
            surnames: payload,
          };
        case 'setUsername':
          return {
            ...state,
            username: payload,
          };
        case 'setPassword':
          return {
            ...state,
            password: payload,
          };
        default:
          return state;
      }
    };
  }

  async login(state: LoginState): Promise<string> {
    const response = await fetch(`${config.API_URL}/login`, {
      headers: this.headers,
      method: 'POST',
      body: JSON.stringify(state),
    });
    const text = await response.text();
    if (response.status !== 200) throw new Error(text);
    else {
      const token = text;
      this.store.set('user-token', token);
      const user = new User(token);
      await user.getData();
      this.store.set('user', user);
      return token;
    }
  }

  async register(state: RegisterState): Promise<string> {
    const response = await fetch(`${config.API_URL}/user`, {
      headers: this.headers,
      method: 'POST',
      body: JSON.stringify(state),
    });
    const text = await response.text();
    if (response.status !== 200) throw new Error(text);
    else {
      const token = text;
      this.store.set('user-token', token);
      const user = new User(token);
      await user.getData();
      this.store.set('user', user);
      return token;
    }
  }

  async guest(): Promise<string> {
    const response = await fetch(`${config.API_URL}/user`, {
      headers: this.headers,
      method: 'POST',
      body: JSON.stringify({ isGuest: true }),
    });
    const text = await response.text();
    if (response.status !== 200) throw new Error(text);
    else {
      const token = text;
      this.store.set('user-token', token);
      const user = new User(token);
      await user.getData();
      this.store.set('user', user);
      return token;
    }
  }

  isLogged(): boolean {
    const token = this.store.get('user-token', false) as string;
    const user = this.store.get('user', false) as User;
    if (!user) return false;
    if (!token) return false;
    return true;
  }

  onChange(callback: CallableFunction): void {
    this.store.onDidChange('user', () => {
      callback();
    });
  }

  getUser(): User {
    if (this.isLogged()) {
      const user = this.store.get('user', false) as User;
      return new User(this.getToken(), user.data);
    }
    throw new Error('User not logged.');
  }

  getToken(): string {
    return this.store.get('user-token', false) as string;
  }

  logout(): void {
    this.store.delete('user-token');
    this.store.delete('user');
  }
}
