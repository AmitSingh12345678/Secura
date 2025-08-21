import React, { useState, useEffect, useRef } from "react";
import queryString from 'query-string';
import io from "socket.io-client";
import * as libsignal from 'libsignal-protocol-javascript';

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';

import './Chat.css';

const ENDPOINT = 'http://localhost:5001/';
let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [users, setUsers] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [publicKeys, setPublicKeys] = useState({});
  const [sessions, setSessions] = useState({});
  const myKeyPair = useRef(null);
  const myIdentityKey = useRef(null);

  // 1. Generate identity and pre-key on mount
  useEffect(() => {
    (async () => {
      // Generate identity key pair
      myIdentityKey.current = await libsignal.KeyHelper.generateIdentityKeyPair();
      // Generate pre-key
      myKeyPair.current = await libsignal.KeyHelper.generatePreKey(Math.floor(Math.random() * 1000000));
    })();
  }, []);

  // 2. Connect and join room
  useEffect(() => {
    const { name, room } = queryString.parse(location.search);
    socket = io(ENDPOINT);
    setRoom(room);
    setName(name);

    socket.emit('join', { name, room }, (error) => {
      if(error) alert(error);
      // After join, send our public key
      setTimeout(async () => {
        const pubKey = arrayBufferToBase64(myIdentityKey.current.pubKey);
        socket.emit('signal-public-key', { room, publicKey: pubKey });
      }, 500);
    });

    // Listen for all public keys in the room
    socket.on('signal-public-keys', (keys) => {
      setPublicKeys(keys);
    });

    // Listen for encrypted messages
    socket.on('encrypted-message', async ({ ciphertext, senderId }) => {
      if (!sessions[senderId]) return; // No session with sender
      try {
        const plaintext = await libsignal.SessionCipher.decryptPreKeyWhisperMessage(
          sessions[senderId], base64ToArrayBuffer(ciphertext), 'binary'
        );
        setMessages(messages => [ ...messages, { user: senderId, text: new TextDecoder().decode(plaintext) } ]);
      } catch (e) {
        setMessages(messages => [ ...messages, { user: senderId, text: '[Decryption failed]' } ]);
      }
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [location.search, sessions]);

  // 3. Establish sessions with all users when public keys change
  useEffect(() => {
    (async () => {
      const newSessions = { ...sessions };
      for (const [socketId, pubKeyBase64] of Object.entries(publicKeys)) {
        if (socketId === socket.id || newSessions[socketId]) continue;
        const pubKey = base64ToArrayBuffer(pubKeyBase64);
        // Create a session with each user
        const address = new libsignal.SignalProtocolAddress(socketId, 1);
        const sessionBuilder = new libsignal.SessionBuilder(window.signalStore, address);
        await sessionBuilder.processPreKey({
          identityKey: pubKey,
          registrationId: 1,
          preKey: { keyId: 1, publicKey: pubKey },
          signedPreKey: { keyId: 1, publicKey: pubKey, signature: new Uint8Array(64) }
        });
        newSessions[socketId] = sessionBuilder;
      }
      setSessions(newSessions);
    })();
  }, [publicKeys]);

  // 4. Send encrypted message to all users
  const sendMessage = async (event) => {
    event.preventDefault();
    if(message && Object.keys(sessions).length > 0) {
      for (const [recipientId, session] of Object.entries(sessions)) {
        try {
          const cipher = new libsignal.SessionCipher(window.signalStore, new libsignal.SignalProtocolAddress(recipientId, 1));
          const ciphertext = await cipher.encrypt(new TextEncoder().encode(message));
          socket.emit('encrypted-message', {
            room,
            ciphertext: arrayBufferToBase64(ciphertext.body),
            senderId: socket.id
          });
        } catch(e) {
          // Handle error
        }
      }
      setMessage('');
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      <TextContainer users={users}/>
    </div>
  );
}

export default Chat;

// Helper functions
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}