import Store from 'electron-store';
import { TOptions } from 'i18next';
import Auth from './auth';
import User from './user';

export { Log };

interface Message {
  date: Date;
  params?: TOptions;
  translation: string;
  userId: number;
}

const auth = new Auth();

export default class Log {
  store = new Store();

  messages: Message[];

  user: User;

  constructor(user: User | undefined = undefined) {
    this.user = user || auth.getUser();
    this.messages = this.loadMessages();
  }

  send(code: string, params: TOptions | undefined = undefined): void {
    const translation = `logs.${code}`;
    this.messages.push({
      translation,
      params,
      date: new Date(),
      userId: this.user.data.id,
    });
    this.update();
  }

  private update() {
    this.store.set('log-messages', this.messages);
  }

  private loadMessages(): Message[] {
    const messages = this.store.get('log-messages', false) as Message[];
    if (messages) {
      return messages
        .filter((message) => message.userId === this.user.data.id)
        .map((msg) => ({ ...msg, date: new Date(msg.date) }));
    }
    return [];
  }

  getMessages(): Message[] {
    return this.loadMessages().reverse();
  }
}
