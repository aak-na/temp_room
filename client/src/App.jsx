import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './index.css';

// Socket connection
const socket = io('http://localhost:5000');

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (roomName.trim()) {
      navigate(`/chat/${roomName}`);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🚀 Temp Room</h1>
        <p className="subtitle">Real-time chat. No logs. Ephemeral by design.</p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Enter Room Name..."
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Join / Create Room</button>
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const [status, setStatus] = useState('Connecting...');

  useEffect(() => {
    socket.on('connect', () => {
      setStatus('Connected (Real-time Active)');
    });

    socket.on('disconnect', () => {
      setStatus('Disconnected');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>Chat Room</h1>
        <p className={`subtitle ${status === 'Connected (Real-time Active)' ? 'text-green' : ''}`}>
          Status: {status}
        </p>
        <div style={{ marginTop: '2rem' }}>
          <p>This is a placeholder for the chat interface.</p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
