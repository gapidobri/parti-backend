import { Server } from 'socket.io';

interface PlaybackState {
  state: 'play' | 'pause';
  offset: number;
  time: number;
}

interface Event {
  name: string;
  data: any;
}

const io = new Server(3000);

io.on('connection', (socket) => {
  let roomName: string | null = null;

  console.log('New connection', socket.id);

  socket.on('disconnect', () => {
    console.log('Disconnected', socket.id);
  });

  socket.on('state', (state: PlaybackState) => {
    console.log(state);

    if (roomName) {
      socket.to(roomName).emit('state', state);
    } else {
      socket.broadcast.emit('state', state);
    }
  });

  socket.on('joinroom', (event: Event) => {
    console.log('Join room', event.name);
    roomName = event.name;
    socket.join(event.name);
  });

  socket.on('leaveroom', (event: Event) => {
    console.log('Leave room', event.name);
    roomName = null;
    socket.leave(event.name);
  });
});
