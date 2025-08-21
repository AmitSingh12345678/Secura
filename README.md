# Secura

Secura is a modern, real-time group chat application designed with privacy and security at its core. Leveraging end-to-end encryption based on the Signal Protocol, Secura ensures that only you and your intended recipients can read your messages—no one else, not even the server. With support for both public and private rooms, intuitive group management, and seamless encrypted communication, Secura is the ideal choice for secure, confidential conversations in any setting.

---

## Features

- **End-to-End Encryption:** All messages are encrypted on the client using the Signal Protocol. Only intended recipients can decrypt and read messages.
- **Group Chat:** Create or join public and private chat rooms with multiple users.
- **Private Rooms:** Protect rooms with a passkey for restricted access.
- **Real-Time Messaging:** Instant message delivery using Socket.IO.
- **User Presence:** See who is online in each room.
- **Modern UI:** Clean, responsive React interface.

---

## How It Works

- **Key Exchange:** When users join a room, they exchange public keys using the server as a relay. Each client establishes secure sessions with every other participant.
- **Encryption:** Messages are encrypted on the sender’s device and decrypted only by recipients. The server never sees plaintext messages or private keys.
- **Room Privacy:** Private rooms require a passkey to join, and this passkey is never stored or transmitted in plaintext.

---

## Tech Stack

- **Frontend:** React, Socket.IO-client, libsignal-protocol-javascript
- **Backend:** Node.js, Express, Socket.IO
- **Encryption:** Signal Protocol (via [libsignal-protocol-javascript](https://github.com/signalapp/libsignal-protocol-javascript))

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

#### 1. Clone the repository

```sh
git clone https://github.com/yourusername/secura.git
cd secura
```

#### 2. Install server dependencies

```sh
cd server
npm install
```

#### 3. Install client dependencies

```sh
cd ../client
npm install
npm install https://github.com/signalapp/libsignal-protocol-javascript
```

### Running the Application

#### 1. Start the backend server

```sh
cd server
npm start
```

#### 2. Start the frontend client

```sh
cd ../client
npm start
```

The client will run on [http://localhost:3000](http://localhost:3000) and the server on [http://localhost:5001](http://localhost:5001) by default.

---

## Usage

1. **Create or Join a Room:**  
   - Enter your name and a room name.
   - To create a private room, select "Private" and set a passkey.
   - To join a private room, enter the correct passkey.

2. **Start Chatting:**  
   - All messages are encrypted end-to-end.
   - Only users in the room can read the messages.

3. **User Presence:**  
   - See the list of users currently in the room.

---

## Security Notes

- **End-to-End Encryption:**  
  Secura uses the Signal Protocol for secure key exchange and message encryption. All encryption and decryption happen on the client side.
- **No Plaintext on Server:**  
  The server only relays encrypted messages and public keys. It never has access to private keys or decrypted messages.
- **Forward Secrecy:**  
  The Signal Protocol provides forward secrecy, so past messages remain secure even if a key is compromised.
- **Room Passkeys:**  
  Private room passkeys are never stored or transmitted in plaintext.

---

## Project Structure

```
project_chat_application/
├── client/
│   └── src/
│       └── components/
│           ├── Chat/
│           ├── Join/
│           ├── InfoBar/
│           ├── Input/
│           ├── Messages/
│           └── TextContainer/
├── server/
│   ├── index.js
│   ├── users.js
│   ├── rooms.js
│   └── router.js
└── README.md
```

---

## Acknowledgements

- [Signal Protocol](https://signal.org/docs/)
- [libsignal-protocol-javascript](https://github.com/signalapp/libsignal-protocol-javascript)
- [Socket.IO](https://socket.io/)
- [React](https://reactjs.org/)

---

## License

This project is licensed under the MIT License.

---

## Disclaimer

This project is for educational purposes and demonstrates the integration of end-to-end encryption in a chat application. For production use, further security audits and enhancements are
