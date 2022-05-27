import { Server } from 'socket.io';

let clientLatency: Record<string, number> = {};

interface State {
  playing: boolean;
  time: number;
}

const io = new Server(3000);

io.on('connection', (socket) => {
  console.log('New connection');

  socket.on('disconnect', () => {
    delete clientLatency[socket.id];
    console.log('Disconnected');
  });

  socket.on('state', (state: State) => {
    if (state.playing) {
      state.time += clientLatency[socket.id] / 1000;
    }

    console.log('New report: playing:', state.playing, 'time:', state.time);

    socket.broadcast.emit('state', state);
  });

  socket.on('ping', (start) => {
    clientLatency[socket.id] = (Date.now() - start) / 2;
  });

  setInterval(() => {
    socket.emit('ping', Date.now());
  }, 1000);
});
