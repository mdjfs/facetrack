import * as config from '../config.json';

interface UserData {
  id: number;
  username?: string;
  email?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  names: string;
  surnames: string;
  isGuest: boolean;
  isValidated: boolean;
}

class User {
  headers: Headers = new Headers();

  data: UserData;

  constructor(token: string, data: UserData | null = null) {
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Authorization', token);
    if (data) this.data = data;
  }

  async getData(): Promise<[Error | null, UserData | null]> {
    try {
      const response = await fetch(`${config.API_URL}/user`, {
        headers: this.headers,
        method: 'GET',
      });
      if (response.status !== 200) {
        const text = await response.text();
        throw new Error(text);
      } else {
        const json: UserData = (await response.json()) as UserData;
        this.data = json;
        return [null, this.data];
      }
    } catch (e) {
      return [e, null];
    }
  }
}

export { UserData, User };
export default User;
