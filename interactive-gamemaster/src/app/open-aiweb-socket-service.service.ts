// src/app/services/openai-websocket.service.ts
import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpenAIWebSocketService {
  private socket$: WebSocketSubject<any> | undefined;
  private wsUrl = 'ws://localhost:8080';  // Node.js WebSocket server URL
  private receivedMessages$ = new Subject<any>();

  constructor() {}

  // Initialize WebSocket connection to Node.js server
  connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: this.wsUrl,
        deserializer: (e) => JSON.parse(e.data),
        serializer: (value) => JSON.stringify(value),
      });

      // Subscribe to incoming messages from the server
      this.socket$.subscribe({
        next: (message) => this.receivedMessages$.next(message),
        error: (err) => console.error('WebSocket error:', err),
      });
    }
  }

  // Send a message to the WebSocket server
  send(message: any): void {
    if (this.socket$) {
      this.socket$.next(message);
    } else {
      console.error('WebSocket connection is not established.');
    }
  }

  // Observable for receiving messages
  getMessages() {
    return this.receivedMessages$.asObservable();
  }

  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = undefined;
    }
  }
}
