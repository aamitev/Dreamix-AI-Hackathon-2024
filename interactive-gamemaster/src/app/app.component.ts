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

  story: string = 'A knight stands at the entrance of a dark cave.';
  isStoryFinished: boolean = false;
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: environment.openaiApiKey, dangerouslyAllowBrowser: true
    });
  }

  // Function to expand the story using OpenAI's /v1/chat/completions endpoint
  async expandStory(currentContext: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',  // Ensure you're using a chat model
      messages: [
        {role: 'system', content: 'You are a storyteller. Continue the following story.'},
        {role: 'user', content: currentContext}
      ],
      max_tokens: 5000,
      temperature: 0.7
    });

    // @ts-ignore
    return response.choices[0]?.message?.content.trim() || '';
  }

  // Function to continue the story (triggered by button click)
  async continueStory() {
    const userAction = window.prompt(`${this.story}\n\nWhat does the knight do next? (Type 'end' to finish)`);

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
