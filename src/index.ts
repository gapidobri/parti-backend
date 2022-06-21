import { Server } from 'socket.io';

interface PlaybackState {
  state: 'play' | 'pause';
  offset: number;
  time: number;
}

interface Event<T> {
  room: string;
  data: T;
}

let roomStates: Record<string, PlaybackState> = {};

const io = new Server(3000);

io.on('connection', (socket) => {
  const rooms = new Set<string>([]);

  console.log('New connection', socket.id);

  socket.on('disconnect', () => {
    console.log('Disconnected', socket.id);
  });

  socket.on('state', (event: Event<PlaybackState>) => {
    console.log(event);

    if (event.room) {
      roomStates[event.room] = event.data;
      console.log(roomStates);
    }

    if (rooms.has(event.room)) {
      socket.to(event.room).emit('state', event);
    }
  });

  socket.on('joinroom', (roomName: string) => {
    console.log('Join room', roomName);

    socket.join(roomName);

    rooms.add(roomName);

    console.log(roomStates);

    if (roomStates[roomName]) {
      console.log('Sending current state');
      socket.emit('state', {
        room: roomName,
        data: roomStates[roomName],
      });
    } else {
      console.log('State not found');
    }
  });

  socket.on('leaveroom', (roomName: string) => {
    console.log('Leave room', roomName);
    rooms.delete(roomName);
    socket.leave(roomName);
  });
});
