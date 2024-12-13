
// server/index.js
const { Server } = require('socket.io');
const io = new Server(3001);

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('move', (data) => {
    // Broadcast movement to other players
    socket.broadcast.emit('playerMoved', data);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

console.log('WebSocket server running on port 3001');
