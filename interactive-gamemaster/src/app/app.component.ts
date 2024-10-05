import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import OpenAI from 'openai';
import {NgIf} from '@angular/common';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  story: string = '';
  isStoryFinished: boolean = false;
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: environment.openaiApiKey,
      dangerouslyAllowBrowser: true
    });
  }

  // Function to expand the story using OpenAI's /v1/chat/completions endpoint
  async expandStory(currentContext: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {role: 'system', content: `You are a Dungeon Master in a tabletop RPG. You are guiding the player through a world of fantasy. Your responses should be detailed but concise,
                    offering descriptions of the world, challenges, or characters the player encounters. The player must have choices to make.
                    Ensure that the output is between 300 and 400 characters.`},
        {role: 'user', content: currentContext}
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    // @ts-ignore
    return response.choices[0]?.message?.content.trim() || '';
  }

  async startStory() {
    const initialStory = window.prompt("Enter the initial context for your story:");

    if (!initialStory) {
      alert("You need to provide a starting point for the story.");
      return;
    }

    this.story = initialStory;  // Set the story to the user's input
  }

  // Function to continue the story (triggered by button click)
  async continueStory() {

    const userAction = window.prompt(`${this.story}\n\nWhat would you do next? (Type 'end' to finish)`);

    // If user types 'end', stop the story
    if (userAction?.toLowerCase() === 'end') {
      this.endStory();
      return;
    }

    // Append the user's action to the current story context
    if (userAction) {
      this.story += `\nYou decided to: ${userAction}`;
    }

    // Expand the story using OpenAI
    const expandedStory = await this.expandStory(this.story);
    this.story += `\n${expandedStory}`;
  }

  // Function to end the story
  endStory() {
    this.isStoryFinished = true;
    this.story += '\n\nThe story ends here. Thanks for playing!';
  }
}
