# Dreamix-AI-Hackathon-2024
DNDGPT - Interactive Dungeon and Dragons Game
DNDGPT is an interactive AI-based Dungeon and Dragons (DnD) game that lets users experience storytelling and game interactions in real time. It leverages OpenAI's powerful language and image models to simulate the role of a Dungeon Master (DM), providing a rich, engaging world for players to explore. You can interact with the game via text, and it can also generate images and play audio segments of the story.

Key Features
Interactive Storytelling: The AI acts as a Dungeon Master and responds to user input, providing detailed scenarios and challenges.
Real-time API Integration: Uses WebSocket to handle real-time interaction, ensuring a seamless experience between the player and the game.
Image Generation: With the integration of OpenAI's DALL-E model, users can generate scene images from text descriptions during gameplay.
Audio Playback: The game supports audio playback of the latest story segment using real-time audio delta streams.
Technologies Used
OpenAI API: Leveraging OpenAI's GPT and DALL-E models for text generation and image creation.
WebSocket for Real-time Interaction: Real-time communication between the client and the game server ensures dynamic updates and a smooth experience.
Angular Framework: The frontend is built using Angular for a clean and responsive user interface.
WavEncoder: Used for encoding audio streams into playable WAV files.
RxJS: For handling real-time WebSocket connections and event streams.
API Key Setup
To use OpenAI's API, you'll need to set up an API key. Follow these steps:

Step 1: Get OpenAI API Key
Visit OpenAI's platform and sign up for an account.
Go to your OpenAI dashboard and navigate to the API Keys section.
Generate a new API key. Copy this key as you will need it to run the game.
Step 2: Configure Your API Key in the Project
Once you have your API key, you need to store it in the project environment file.

In the src/environments/ folder, open or create the environment.ts file.

Add the following lines to include your API key:

typescript
Copy code
export const environment = {
  production: false,
  openaiApiKey: 'your-openai-api-key-here'
};
Replace 'your-openai-api-key-here' with the actual API key you copied from OpenAI.

The environment.ts file should now look like this:

typescript
Copy code
export const environment = {
  production: false,
  openaiApiKey: 'sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' // Your API Key
};
Step 3: Use the API Key
The API key is securely loaded into the OpenAIWebSocketService and AppComponent, ensuring all requests to OpenAI's APIs are authenticated.

Running the Project
Install Dependencies:

Ensure you have node.js and npm installed.
Run npm install to install all the necessary dependencies.
Run the Application:

Use the command ng serve to run the Angular application.
The application will be available at http://localhost:4200/ in your browser.
How It Works
Start the Game: Users provide an initial context for the story (e.g., "You find yourself in a dark forest with unknown creatures lurking nearby.").
Story Progression: The AI, acting as a Dungeon Master, responds based on the player’s input, continuing the story with prompts and decisions that the user makes.
Visual Generation: Users can describe scenes and generate associated images using DALL-E.
Audio Playback: The most recent part of the story can be played back as audio, giving users an immersive experience.
Final Words
Enjoy playing DNDGPT and experience an engaging, dynamic, and AI-powered Dungeon and Dragons game.
