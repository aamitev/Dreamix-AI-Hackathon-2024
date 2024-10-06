import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  messageContent = '';
  sender = 'User'; // You could customize this to have dynamic sender names

  constructor(private chatService: ChatService) {}

  sendMessage(): void {
    if (this.messageContent.trim()) {
      this.chatService.addMessage(this.sender, this.messageContent);
      this.messageContent = ''; // Clear the input field
    }
  }
}
