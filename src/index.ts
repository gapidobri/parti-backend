import { Server } from 'socket.io';

interface PlaybackState {
  state: 'play' | 'pause';
  offset: number;
  time: number;
}

let connections = 0;

const io = new Server(3000);

io.on('connection', (socket) => {
  connections++;
  console.log('New connection', connections);

  socket.on('disconnect', () => {
    console.log('Disconnected');
    connections--;
  });

  socket.on('state', (state: PlaybackState) => {
    console.log(state);

    socket.broadcast.emit('state', state);
  });
});
