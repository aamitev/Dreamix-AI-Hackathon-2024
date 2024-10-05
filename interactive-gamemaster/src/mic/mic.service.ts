import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MicrophoneService {
  private stream: MediaStream | undefined;
  private mediaRecorder: MediaRecorder | undefined;
  private audioChunks: Blob[] = [];
  private audioElement: HTMLAudioElement | undefined;

  constructor() {}

  // Start capturing the microphone input and play it
  async startRecording(): Promise<void> {
    try {
      // Request access to the microphone
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize MediaRecorder to capture audio chunks
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];  // Clear any previous audio chunks

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        // When recording stops, create an audio Blob and play it
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play the audio using an HTMLAudioElement
        this.audioElement = new Audio(audioUrl);
        this.audioElement.controls = true;
        this.audioElement.play();
        document.body.appendChild(this.audioElement);
      };

      // Start recording
      this.mediaRecorder.start();
      console.log('Microphone stream started and recording.');
    } catch (error) {
      console.error('Error accessing the microphone:', error);
    }
  }

  // Stop recording the microphone input
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      console.log('Recording stopped.');
    }

    // Stop microphone stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      console.log('Microphone stream stopped.');
    }
  }
}
