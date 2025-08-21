const rooms = [];

function createRoom({ name, visibility, passkey }) {
  if (rooms.find(room => room.name === name)) {
    return { error: 'Room name already exists.' };
  }
  const room = { name, visibility, passkey: visibility === 'private' ? passkey : null };
  rooms.push(room);
  return { room };
}

function getRoom(name) {
  return rooms.find(room => room.name === name);
}

module.exports = { createRoom, getRoom };