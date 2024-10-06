import {Injectable} from '@angular/core';

export interface Message {
  sender: string;
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  messages: Message[] = [];

  constructor() {}

  addMessage(sender: string, content: string): void {
    this.messages.push({ sender, content, timestamp: new Date() });
  }

  getLatestUserMessage(): string | undefined {
    return this.messages.reverse().find(elm => elm.sender === 'User')?.content;
  }
}
