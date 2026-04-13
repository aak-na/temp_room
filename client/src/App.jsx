import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './index.css';

// Socket connection
const socket = io('http://localhost:5000');

const Header = () => (
  <header className="header">
    <div className="brand">
      Echo <span className="live-dot"></span>
    </div>
    <div className="text-muted" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
      SECURE & LIVE
    </div>
  </header>
);

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/chat/${data.sessionId}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="glass-card">
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 700 }}>Temp Room</h1>
        <p className="text-muted" style={{ marginBottom: '3rem', fontSize: '1.1rem' }}>
          Sophisticated. Minimal. Ephemeral.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <button className="action-button" onClick={handleCreateSession} disabled={isLoading}>
            {isLoading ? 'GENERATING...' : 'CREATE NEW SESSION'}
          </button>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
            <span className="text-muted" style={{ fontSize: '0.8rem' }}>OR JOIN EXISTING</span>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }}></div>
          </div>
          <input
            className="input-container"
            style={{ width: '100%', maxWidth: '100%', textAlign: 'center', padding: '1rem' }}
            placeholder="ENTER SESSION CODE"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && roomName && navigate(`/chat/${roomName}`)}
          />
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { roomId } = useParams();
  const [status, setStatus] = useState('CONNECTING');
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to Echo. This room is temporary and secure.", own: false },
    { id: 2, text: "The architectural panels ensure a cinematic reading experience.", own: false },
  ]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    socket.emit('join-session', roomId);

    socket.on('joined', (data) => {
      setStatus('SECURE');
    });

    socket.on('error', () => {
      setStatus('ERROR');
    });

    return () => {
      socket.off('joined');
      socket.off('error');
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { id: Date.now(), text: inputValue, own: true }]);
      setInputValue('');
    }
  };

  return (
    <>
      <Header />
      <div className="chat-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="text-muted" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>
            SESSION: {roomId.slice(0, 8).toUpperCase()} • STATUS: <span className="text-brass">{status}</span>
          </span>
        </div>
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.own ? 'message-own' : 'message-received'}`}
          >
            {msg.text}
          </div>
        ))}
        
        <div className="input-wrapper">
          <div className="input-container">
            <input
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button className="send-button" onClick={handleSendMessage}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:roomId" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
