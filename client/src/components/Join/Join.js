import React, { useState } from 'react';
import io from 'socket.io-client';
import { useHistory } from 'react-router-dom';

import './Join.css';

const ENDPOINT = 'http://localhost:5001/';
let socket;

const Join = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [passkey, setPasskey] = useState('');
  const [joinPasskey, setJoinPasskey] = useState('');
  const history = useHistory();

  const handleCreateRoom = (e) => {
    console.log("inside handle create room");
    e.preventDefault();
    if (!name || !room) return;

    socket = io(ENDPOINT);

    socket.emit('createRoom', { name: room, visibility, passkey }, (error, createdRoom) => {
      if (error) {
        alert(error);
        return;
      }
      console.log('Room created: ', createdRoom);
      // After room creation, join the room
      socket.emit('join', { name, room, passkey }, (joinError) => {
        if (joinError) {
          alert(joinError);
          return;
        }
        history.push(`/chat?name=${name}&room=${room}`);
      });
    });
  };

  const handleJoinRoom = (e) => {
    console.log("inside handle join room");
    e.preventDefault();
    if (!name || !room) return;

    socket = io(ENDPOINT);

    socket.emit('join', { name, room, passkey: joinPasskey }, (error) => {
      if (error) {
        alert(error);
        return;
      }
      history.push(`/chat?name=${name}&room=${room}`);
    });
  };

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">{isCreating ? 'Create Room' : 'Join Room'}</h1>
        <input placeholder="Name" className="joinInput" type="text" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Room" className="joinInput mt-20" type="text" onChange={(e) => setRoom(e.target.value)} />

        {isCreating ? (
          <>
            <div className="mt-20">
              <label>
                <input
                  type="radio"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                /> Public
              </label>
              <label style={{ marginLeft: '20px' }}>
                <input
                  type="radio"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                /> Private
              </label>
            </div>
            {visibility === 'private' && (
              <input
                placeholder="Passkey"
                className="joinInput mt-20"
                type="password"
                onChange={(e) => setPasskey(e.target.value)}
              />
            )}
            <button className="button mt-20" type="submit" onClick={handleCreateRoom}>
              Create & Join
            </button>
          </>
        ) : (
          <>
            <input
              placeholder="Passkey (if private room)"
              className="joinInput mt-20"
              type="password"
              onChange={(e) => setJoinPasskey(e.target.value)}
            />
            <button className="button mt-20" type="submit" onClick={handleJoinRoom}>
              Join Room
            </button>
          </>
        )}

        <button
          className="button mt-20"
          style={{ background: 'none', color: '#2979FF', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? 'Switch to Join Room' : 'Switch to Create Room'}
        </button>
      </div>
    </div>
  );
};

export default Join;