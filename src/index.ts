import { Server } from 'socket.io';

interface State {
  playing: boolean;
  time: number;
}

let connections = 0,
  maxStates = 0;
let clientLatency: Record<string, number> = {};
let clientState: Record<string, State> = {};

const io = new Server(3000);

io.on('connection', (socket) => {
  connections++;
  console.log('New connection', connections);

  socket.on('disconnect', () => {
    console.log('Disconnected');
    connections--;
    delete clientLatency[socket.id];
    delete clientState[socket.id];
  });

  socket.on('state', (state: State) => {
    if (state.playing) {
      state.time += (clientLatency[socket.id] ?? 0) / 1000;
    }

    console.log('New report: playing:', state.playing, 'time:', state.time);

    socket.broadcast.emit('state', state);
  });

  socket.on('ping', (start: number) => {
    clientLatency[socket.id] = (Date.now() - start) / 2;
  });

  socket.on('sync', (state: State) => {
    clientState[socket.id] = state;

    if (Object.keys(clientState).length < maxStates) {
      return;
    }

    maxStates = Object.keys(clientState).length;

    console.log(clientState);

    let max = state.time;
    for (const id in clientState) {
      if (clientState[id].time > max) {
        max = clientState[id].time;
      }
    }

    for (const id in clientState) {
      if (max - clientState[id].time > 0.5) {
        console.log('Out of sync');
        socket.to(id).emit('state', { ...state, time: max });
      }
    }
  });

  setInterval(() => {
    socket.emit('ping', Date.now());
  }, 10000);
});

// setInterval(() => {
//   clientState = {};
//   io.emit('sync');
// }, 1000);
