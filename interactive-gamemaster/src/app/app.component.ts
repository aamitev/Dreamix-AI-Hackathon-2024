import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NgIf, NgOptimizedImage} from '@angular/common'; // WebSocket service for story handling
import OpenAI from 'openai'; // Direct OpenAI client for image handling
import { environment } from '../environments/environment'; // Your environment with API keys
import { Subscription } from 'rxjs';
import {FormsModule} from '@angular/forms';
import {OpenAIWebSocketService} from './open-aiweb-socket-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, FormsModule, FormsModule, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  story: string = '';  // Holds the story text
  isStoryFinished: boolean = false;  // Flag for checking if the story has ended
  prompt: string = '';  // Holds the user prompt for DnD scene generation
  image_url: string | undefined = '';  // Holds the generated image URL
  private openai: OpenAI;  // OpenAI client for image generation

  private messagesSubscription!: Subscription;  // Subscription to handle WebSocket messages

  constructor(private openAIWebSocketService: OpenAIWebSocketService) {
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

      if (message.type === 'response.done') {
        if (message.response.output[0].content[0].text) {

          // console.log(message.text);
          // If the message is a story update
          this.story += `\n${message.response.output[0].content[0].text}`;
          this.isStoryFinished = false; // Reset end-of-story flag
        }
      }
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
        modalities: ['text'],
        instructions: "`You are a Dungeon Master in a tabletop RPG. You are guiding the player through a world of fantasy. Your responses should be detailed but concise offering descriptions of the world, challenges, or characters the player encounters. The player must have choices to make. Ask players for preferences (genre, setting, tone, rules); generate world (locations, NPCs, factions, story hook); recap past events; ask for player actions; resolve with dice or rules; manage NPCs and story based on player choices; use turn-based system for combat; balance difficulty and progression; end session with summary and hints." + initialStory,
      },
    });
  }

  // Continue the story based on user input
  async continueStory() {
    const userAction = window.prompt(`${this.story}\n\nWhat would you do next? (Type 'end' to finish)`);

    // End the story if the user types 'end'
    if (userAction?.toLowerCase() === 'end') {
      this.endStory();
      return;
    }

    // Send the user's action to the server
    this.openAIWebSocketService.send({
      type: 'response.create',
      response: {
        modalities: ['text'],
        instructions: "`You are a Dungeon Master in a tabletop RPG. You are guiding the player through a world of fantasy. Your responses should be detailed but concise offering descriptions of the world, challenges, or characters the player encounters. The player must have choices to make. Ask players for preferences (genre, setting, tone, rules); generate world (locations, NPCs, factions, story hook); recap past events; ask for player actions; resolve with dice or rules; manage NPCs and story based on player choices; use turn-based system for combat; balance difficulty and progression; end session with summary and hints." + userAction,
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
        model: 'dall-e-3',  // Using the DALL-E 3 model
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      });

      if (response && response.data && response.data.length > 0) {
        this.image_url = response.data[0].url;  // Set the generated image URL
      } else {
        console.error('No image URL found in the response.');
        this.image_url = '';  // Clear the image if no URL is returned
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }

  // End the story
  endStory() {
    this.isStoryFinished = true;
    this.story += '\n\nThe story ends here. Thanks for playing!';
  }

  // Clean up the WebSocket connection when the component is destroyed
  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    this.openAIWebSocketService.disconnect();
  }
}
