import { Component, OnInit } from '@angular/core';
import { ChatService, Message } from '../chat.service';
import {MessageInputComponent} from '../message-input/message-input.component';
import {DatePipe, NgForOf} from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  standalone: true,
  imports: [
    MessageInputComponent,
    DatePipe,
    NgForOf
  ],
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.messages = this.chatService.messages;
  }
}
