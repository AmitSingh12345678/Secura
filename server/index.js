const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const { createRoom, getRoom } = require('./rooms');

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);


const userPublicKeys = {}; // { room: { socketId: publicKey, ... } }

io.on('connect', (socket) => {
  socket.on('createRoom', ({ name, visibility, passkey }, callback) => {
    const { error, room } = createRoom({ name, visibility, passkey });
    if (error) return callback(error);
    callback(null, room);
  });

  socket.on('join', ({ name, room, passkey }, callback) => {
    console.log('Room join request: ', { name, room, passkey});
    const roomObj = getRoom(room);
    if (!roomObj) return callback('Room does not exist.');

    if (roomObj.visibility === 'private' && roomObj.passkey !== passkey) {
      return callback('Incorrect passkey for private room.');
    }

    const { error, user } = addUser({ id: socket.id, name, room });

    console.log('User added: ', user, socket.id, name, room);
    if(error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    console.log('sendMessage called with: ', message, socket.id);
    if (!user) return;

    console.log(`Message from ${user.name} in room ${user.room}: ${message}`);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    console.log("User disconnected: ", user);

     // Remove public key on disconnect
    for (const room in userPublicKeys) {
      delete userPublicKeys[room][socket.id];
      if (Object.keys(userPublicKeys[room]).length === 0) {
        delete userPublicKeys[room];
      }
    }

    if(user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
    }
  })

  // Relay public keys
  socket.on('signal-public-key', ({ room, publicKey }) => {
    if (!userPublicKeys[room]) userPublicKeys[room] = {};
    userPublicKeys[room][socket.id] = publicKey;
    io.to(room).emit('signal-public-keys', userPublicKeys[room]);
  });

  // Relay encrypted messages
  socket.on('encrypted-message', ({ room, ciphertext, senderId }) => {
    // Broadcast to all in the room except sender
    socket.to(room).emit('encrypted-message', { ciphertext, senderId });
  });
});

server.listen(process.env.PORT || 5001, () => console.log(`Server has started.`));