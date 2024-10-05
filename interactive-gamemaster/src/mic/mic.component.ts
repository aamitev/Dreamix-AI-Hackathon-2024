import { Component } from '@angular/core';
import { MicrophoneService } from './mic.service';

@Component({
  selector: 'app-mic',
  templateUrl: './mic.component.html',
  standalone: true
})
export class MicComponent {
  constructor(private microphoneService: MicrophoneService) {}

  // Start recording when button is clicked
  startRecording() {
    this.microphoneService.startRecording();
  }

  // Stop recording when button is clicked
  stopRecording() {
    this.microphoneService.stopRecording();
  }
}
