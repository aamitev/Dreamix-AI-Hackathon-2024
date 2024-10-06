import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {DatePipe, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import OpenAI from 'openai';
import { environment } from '../environments/environment';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { OpenAIWebSocketService } from './open-aiweb-socket-service.service';
import WavEncoder from "wav-encoder";
import {ChatService} from './chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, FormsModule, FormsModule, NgOptimizedImage, DatePipe, NgForOf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  story: string = ''; // Holds the story text
  isStoryFinished: boolean = false; // Flag for checking if the story has ended
  prompt: string = ''; // Holds the user prompt for DnD scene generation
  image_url: string | undefined = ''; // Holds the generated image URL
  private openai: OpenAI; // OpenAI client for image generation
  private messagesSubscription!: Subscription; // Subscription to handle WebSocket messages

  private audioChunks: string[] = []; // Collect audio deltas
  private audioBlobUrl: string | null = null; // Store the audio blob URL
  isAudioReady: boolean = false; // Flag to check if audio is ready to play

  messageContent = '';
  sender = 'User'; // You could customize this to have dynamic sender names


  constructor(private openAIWebSocketService: OpenAIWebSocketService, public chatService: ChatService) {
    this.openai = new OpenAI({
      apiKey: environment.openaiApiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  ngOnInit(): void {
    // Connect to the WebSocket server when the component initializes
    this.openAIWebSocketService.connect();

    // Subscribe to messages received from the WebSocket server
    this.messagesSubscription = this.openAIWebSocketService.getMessages().subscribe((message) => {
      console.log(message);

      if (message.type === 'response.audio.delta') {
        // Handle audio delta messages
        this.handleAudioDelta(message.delta);
      }

      if (message.type === 'response.audio.done') {
        // Once all audio deltas are received, set the audio ready flag to true
        this.prepareAudio();
      }

      if (message.type === 'response.audio_transcript.done') {
        this.chatService.addMessage("GM",message.transcript)

        // If the message is a story update
        this.story += `\n${message.transcript}`;
        this.isStoryFinished = false; // Reset end-of-story flag
      }
    });
  }

  // Collect audio delta chunks
  handleAudioDelta(delta: string) {
    this.audioChunks.push(delta); // Append delta to audio chunks
  }

  prepareAudio() {
    if (this.audioChunks.length === 0) return;

    // Concatenate all audio deltas
    const base64Audio = this.audioChunks.join('');

    // Decode base64 into binary data
    const binaryAudio = atob(base64Audio);
    const pcm16Data = new Int16Array(binaryAudio.length / 2);
    for (let i = 0; i < binaryAudio.length; i += 2) {
      pcm16Data[i / 2] = (binaryAudio.charCodeAt(i + 1) << 8) | binaryAudio.charCodeAt(i);
    }

    // Convert PCM16 (Int16Array) to Float32Array
    const float32Data = new Float32Array(pcm16Data.length);
    for (let i = 0; i < pcm16Data.length; i++) {
      float32Data[i] = pcm16Data[i] / 32768; // Normalize to range -1 to 1
    }

    // Encode PCM16 to WAV using wav-encoder
    WavEncoder.encode({
      sampleRate: 24000, // 24kHz sample rate
      channelData: [float32Data] // Mono channel as Float32Array
    }).then((wavBuffer) => {
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      this.audioBlobUrl = URL.createObjectURL(audioBlob);

      // Mark the audio as ready
      this.isAudioReady = true;
    }).catch((error) => {
      console.error('Error encoding WAV file:', error);
    });
  }

  playAudio() {
    if (!this.isAudioReady || !this.audioBlobUrl) {
      alert('Audio is not ready yet.');
      return;
    }

    const audio = new Audio(this.audioBlobUrl);
    audio.play().catch((error) => {
      console.error('Error playing audio:', error);
    });
  }

  // Start the story by asking for initial context
  async startStory() {
    const initialStory = window.prompt('Enter the initial context for your story:');
    if (!initialStory) {
      alert('You need to provide a starting point for the story.');
      return;
    }

    // Send the initial story to the server
    this.openAIWebSocketService.send({
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions:
          "`You are a Dungeon Master in a tabletop RPG. You are guiding the player through a world of fantasy. Your responses should be detailed but concise offering descriptions of the world, challenges, or characters the player encounters. The player must have choices to make. Ask players for preferences (genre, setting, tone, rules); generate world (locations, NPCs, factions, story hook); recap past events; ask for player actions; resolve with dice or rules; manage NPCs and story based on player choices; use turn-based system for combat; balance difficulty and progression; end session with summary and hints." +
          initialStory,
      },
    });
  }

  // Continue the story based on user input
  async continueStory() {
    // const userAction = window.prompt(`${this.story}\n\nWhat would you do next? (Type 'end' to finish)`);
    const userAction = this.chatService.getLatestUserMessage();

    // End the story if the user types 'end'
    if (userAction?.toLowerCase() === 'end') {
      this.endStory();
      return;
    }

    // Send the user's action to the server
    this.openAIWebSocketService.send({
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions:
          "`You are a Dungeon Master in a tabletop RPG. You are guiding the player through a world of fantasy. Your responses should be detailed but concise offering descriptions of the world, challenges, or characters the player encounters. The player must have choices to make. Ask players for preferences (genre, setting, tone, rules); generate world (locations, NPCs, factions, story hook); recap past events; ask for player actions; resolve with dice or rules; manage NPCs and story based on player choices; use turn-based system for combat; balance difficulty and progression; end session with summary and hints." +
          userAction,
      },
    });


  }

  // Generate a DnD scene image based on a prompt (Directly handled by OpenAI API)
  async generateDnDSceneImage(prompt: string) {
    if (!prompt) {
      alert('Please provide a valid DnD scene description.');
      return;
    }

    try {
      const response = await this.openai.images.generate({
        prompt: prompt,
        model: 'dall-e-3',
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      });

      if (response && response.data && response.data.length > 0) {
        this.image_url = response.data[0].url;
      } else {
        console.error('No image URL found in the response.');
        this.image_url = '';
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }

  endStory() {
    this.isStoryFinished = true;
    this.story += '\n\nThe story ends here. Thanks for playing!';
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    this.openAIWebSocketService.disconnect();
  }

  sendMessage(): void {
    if (this.messageContent.trim()) {
      this.chatService.addMessage(this.sender, this.messageContent);
      this.messageContent = ''; // Clear the input field
    }
  }
}
