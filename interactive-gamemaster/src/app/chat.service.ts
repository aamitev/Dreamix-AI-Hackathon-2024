import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  messages: { sender: string; content: string; timestamp: Date }[] = [];

  addMessage(sender: string, content: string) {
    this.messages.push({
      sender,
      content,
      timestamp: new Date(),
    });
  }

  getLatestUserMessage(): string | null {
    const userMessages = this.messages.filter((msg) => msg.sender === 'User');
    return userMessages.length ? userMessages[userMessages.length - 1].content : null;
  }
}
