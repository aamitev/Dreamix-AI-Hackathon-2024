// server.js
const WebSocket = require('ws');
const axios = require('axios');

// OpenAI WebSocket URL and API Key
const openAiUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
const openAiApiKey = '';

// Create WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(wsClient) {
    console.log('Client connected to the WebSocket server.');

    // Handle messages from the client
    wsClient.on('message', async function incoming(message) {
        const parsedMessage = JSON.parse(message);
        console.log('Received message from client:', parsedMessage);

        // If message type is text, connect to OpenAI WebSocket and forward it
        if (parsedMessage.type === 'response.create') {
            // Connect to OpenAI WebSocket API
            const openAiSocket = new WebSocket(openAiUrl, {
                headers: {
                    'Authorization': `Bearer ${openAiApiKey}`,
                    'OpenAI-Beta': 'realtime=v1',
                },
            });

            // OpenAI WebSocket connection opened
            openAiSocket.on('open', function open() {
                console.log('Connected to OpenAI WebSocket API.');
                openAiSocket.send(JSON.stringify(parsedMessage)); // Forward the client request to OpenAI
            });

            // OpenAI WebSocket message received
            openAiSocket.on('message', function incoming(data) {
                const responseData = JSON.parse(data);
                console.log('Received message from OpenAI:', responseData);
                // Send the response back to the client
                wsClient.send(JSON.stringify(responseData));
            });

            // Handle OpenAI WebSocket errors
            openAiSocket.on('error', (err) => {
                console.error('OpenAI WebSocket error:', err);
            });

            // Close OpenAI WebSocket connection
            openAiSocket.on('close', () => {
                console.log('OpenAI WebSocket connection closed.');
            });
        }
    });

    // Handle WebSocket disconnection
    wsClient.on('close', () => {
        console.log('Client disconnected from the WebSocket server.');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
