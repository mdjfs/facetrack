/* eslint-disable default-case */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable sort-imports */
import Store from 'electron-store';
import * as config from '../config.json';

interface RegisterState{
    names: string,
    surnames: string,
    email: string,
    password: string,
    username: string
}

type RegisterAction = ({type : 'setNames', payload: string} |
{type : 'setSurnames', payload: string} |
{type : 'setEmail', payload: string} |
{type : 'setPassword', payload: string} |
{type : 'setUsername', payload: string});

interface LoginState{
    email?:string,
    username?:string,
    password: string
}

type LoginAction = ({type : 'setEmail', payload: string} |
{type : 'setPassword', payload: string} |
{type : 'setUsername', payload: string});

const AUTH_STORE = new Store();

class Auth {
    store = AUTH_STORE;

    generalRequest = {
      headers: { 'Content-Type': 'application/json' },
    }

    getLoginReducer() {
      return (state: LoginState,
        { type, payload }: LoginAction): LoginState => {
        switch (type) {
          case 'setEmail':
            return {
              ...state,
              email: payload,
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
        }
      };
    }

    getRegisterReducer() {
      return (state: RegisterState,
        { type, payload }: RegisterAction): RegisterState => {
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
        }
      };
    }

    async login(state: LoginState): Promise<[Error|null, string]> {
      try {
        const response = await fetch(`${config.API_URL}/login`, {
          ...this.generalRequest,
          method: 'POST',
          body: JSON.stringify(state),
        });
        const token = await response.text();
        this.store.set('user-token', token);
        return [null, token];
      } catch (e) {
        return [e, ''];
      }
    }

    async register(state: RegisterState): Promise<[Error|null, string]> {
      try {
        const response = await fetch(`${config.API_URL}/user`, {
          ...this.generalRequest,
          method: 'POST',
          body: JSON.stringify(state),
        });
        const token = await response.text();
        this.store.set('user-token', token);
        return [null, token];
      } catch (e) {
        return [e, ''];
      }
    }

    async guest(): Promise<[Error|null, string]> {
      try {
        const response = await fetch(`${config.API_URL}/user`, {
          ...this.generalRequest,
          method: 'POST',
          body: JSON.stringify({ isGuest: true }),
        });
        const token = await response.text();
        this.store.set('user-token', token);
        return [null, token];
      } catch (e) {
        return [e, ''];
      }
    }

    isLogged(): boolean {
      const token = this.store.get('user-token');
      return !!token;
    }

    getToken(): string {
      return this.store.get('user-token') as string;
    }

    logout(): void {
      this.store.delete('user-token');
    }
}

export {
  Auth, LoginAction, RegisterAction, RegisterState, LoginState,
};
export default Auth;
