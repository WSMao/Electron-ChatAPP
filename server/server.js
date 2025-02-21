const WebSocket = require('ws');

const port = process.env.PORT || 8080;
// const wss = new WebSocket.Server({ port: 8080 });
const wss = new WebSocket.Server({ port, host: '0.0.0.0' });

const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const { type, chatId, message: chatMessage } = JSON.parse(message);

    if (type === 'register') {
      clients.set(ws, chatId);
      console.log(`Client ${chatId} connected`);
    } else if (type === 'message') {
      console.log(`Broadcasting message to chat ${chatId}`);
      console.log(`Message: ${chatMessage}`);
      wss.clients.forEach((client) => {
        if (client != ws && client.readyState === WebSocket.OPEN && clients.get(client) === chatId) {
          client.send(JSON.stringify({ message: chatMessage }));
          console.log('server send');
        }
      });
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// console.log(`WebSocket server is running on ws://localhost:${port}`);
console.log(`WebSocket server is running on ws://0.0.0.0:${port}`);