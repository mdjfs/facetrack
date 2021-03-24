/* eslint-disable default-case */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable sort-imports */
import * as config from "../config.json";
import User from "./user";
import Store from "./store";

interface RegisterState {
  names: string;
  surnames: string;
  email: string;
  password: string;
  username: string;
}

type RegisterAction =
  | { type: "setNames"; payload: string }
  | { type: "setSurnames"; payload: string }
  | { type: "setEmail"; payload: string }
  | { type: "setPassword"; payload: string }
  | { type: "setUsername"; payload: string };

interface LoginState {
  email?: string;
  username?: string;
  password: string;
}

type LoginAction =
  | { type: "setEmail"; payload: string }
  | { type: "setPassword"; payload: string }
  | { type: "setUsername"; payload: string };

class Auth {
  store = Store;
  headers: Headers;

  constructor() {
    this.headers = new Headers();
    this.headers.append("Content-Type", "application/json");
  }

  getLoginReducer() {
    return (state: LoginState, { type, payload }: LoginAction): LoginState => {
      switch (type) {
        case "setEmail":
          return {
            ...state,
            email: payload,
            username: undefined,
          };
        case "setUsername":
          return {
            ...state,
            username: payload,
            email: undefined,
          };
        case "setPassword":
          return {
            ...state,
            password: payload,
          };
      }
    };
  }

  getRegisterReducer() {
    return (
      state: RegisterState,
      { type, payload }: RegisterAction
    ): RegisterState => {
      switch (type) {
        case "setEmail":
          return {
            ...state,
            email: payload,
          };
        case "setNames":
          return {
            ...state,
            names: payload,
          };
        case "setSurnames":
          return {
            ...state,
            surnames: payload,
          };
        case "setUsername":
          return {
            ...state,
            username: payload,
          };
        case "setPassword":
          return {
            ...state,
            password: payload,
          };
      }
    };
  }

  async login(state: LoginState): Promise<[Error | null, string]> {
    try {
      const response = await fetch(`${config.API_URL}/login`, {
        headers: this.headers,
        method: "POST",
        body: JSON.stringify(state),
      });
      const text = await response.text();
      if (response.status == 200) {
        const token = text;
        this.store.set("user-token", token);
        const user = new User(token);
        await user.getData();
        this.store.set("user", user);
        return [null, token];
      } else throw new Error(text);
    } catch (e) {
      return [e, ""];
    }
  }

  async register(state: RegisterState): Promise<[Error | null, string]> {
    try {
      const response = await fetch(`${config.API_URL}/user`, {
        headers: this.headers,
        method: "POST",
        body: JSON.stringify(state),
      });
      const text = await response.text();
      if (response.status == 200) {
        const token = text;
        this.store.set("user-token", token);
        const user = new User(token);
        await user.getData();
        this.store.set("user", user);
        return [null, token];
      } else throw new Error(text);
    } catch (e) {
      return [e, ""];
    }
  }

  async guest(): Promise<[Error | null, string]> {
    try {
      const response = await fetch(`${config.API_URL}/user`, {
        headers: this.headers,
        method: "POST",
        body: JSON.stringify({ isGuest: true }),
      });
      const text = await response.text();
      if (response.status == 200) {
        const token = text;
        this.store.set("user-token", token);
        const user = new User(token);
        await user.getData();
        this.store.set("user", user);
        return [null, token];
      } else throw new Error(text);
    } catch (e) {
      return [e, ""];
    }
  }

  isLogged(): boolean {
    return !!this.store.get("user-token") && !!this.store.get("user");
  }

  getUser(): User {
    const user = this.store.get("user") as User;
    return new User(this.getToken(), user.data);
  }

  getToken(): string {
    return this.store.get("user-token") as string;
  }

  logout(): void {
    this.store.delete("user-token");
  }
}

export { Auth, LoginAction, RegisterAction, RegisterState, LoginState };
export default Auth;
