const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const sessionRoutes = require('./routes/sessionRoutes');
const Session = require('./models/Session');
const Message = require('./models/Message');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MONGODB CONNECTION ERROR:', err.message);
    console.log('--------------------------------------------------');
    console.log('POTENTIAL FIXES:');
    console.log('1. Ensure your current IP is whitelisted in Atlas (Network Access tab).');
    console.log('2. Check if your database user password in .env is correct.');
    console.log('3. If you have local MongoDB, try: MONGO_URI=mongodb://localhost:27017/temp_room');
    console.log('--------------------------------------------------');
  });

// API Routes
app.use('/api', sessionRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Server is running and ready for real-time chat!');
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a specific session room
  socket.on('join-session', async (data) => {
    try {
      // Backwards compatibility if old client sends string
      const sessionId = typeof data === 'string' ? data : data.sessionId;
      const userName = typeof data === 'string' ? 'A user' : data.userName;

      socket.join(sessionId);
      console.log(`User ${userName} (${socket.id}) joined room: ${sessionId}`);
      
      // Store for disconnect event
      socket.sessionId = sessionId;
      socket.userName = userName;

      // Broadcast to others in the room
      if (userName && userName !== 'A user') {
          socket.to(sessionId).emit('notification', `${userName} joined the room`);
      }
      
      // Update last activity in DB
      await Session.findOneAndUpdate({ sessionId }, { lastActivity: Date.now() });

      socket.emit('joined', { sessionId, message: `Successfully joined room ${sessionId}` });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room.');
    }
  });

  // Handle sending a message
  socket.on('send-message', async (data) => {
    try {
      const { sessionId, text, sender, replyTo } = data;

      if (!sessionId || !text || !sender) {
        return socket.emit('error', 'Missing message data.');
      }

      // Save message to MongoDB
      const newMessage = new Message({
        sessionId,
        text,
        sender,
        replyTo, // Store reply info
      });
      await newMessage.save();

      // Emit the message to everyone in the room (including the sender)
      io.to(sessionId).emit('receive-message', newMessage);

      // Update session activity
      await Session.findOneAndUpdate({ sessionId }, { lastActivity: Date.now() });
    } catch (error) {
      console.error('Error handling send-message:', error);
      socket.emit('error', 'Failed to send message.');
    }
  });

  // Handle session termination
  socket.on('terminate-session', (sessionId) => {
    console.log(`Session ${sessionId} is being terminated.`);
    io.to(sessionId).emit('session-terminated', { sessionId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.sessionId && socket.userName && socket.userName !== 'A user') {
      socket.to(socket.sessionId).emit('notification', `${socket.userName} left the room`);
    }
  });
});

// Auto-terminate sessions after 10 minutes of inactivity
const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

setInterval(async () => {
  try {
    const cutoffTime = new Date(Date.now() - INACTIVITY_LIMIT);
    
    // Find active sessions that haven't had activity since the cutoff time
    const inactiveSessions = await Session.find({
      isActive: true,
      lastActivity: { $lt: cutoffTime }
    });

    if (inactiveSessions.length > 0) {
      for (const session of inactiveSessions) {
        console.log(`Auto-terminating inactive session: ${session.sessionId}`);
        
        // Mark as inactive
        session.isActive = false;
        await session.save();

        // Delete all messages for this session (ephemeral)
        await Message.deleteMany({ sessionId: session.sessionId });

        // Emit termination event so clients are kicked out
        io.to(session.sessionId).emit('session-terminated', { sessionId: session.sessionId });
      }
    }
  } catch (error) {
    console.error('Error in auto-termination job:', error);
  }
}, 60 * 1000); // Check every minute

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('App version: 1.0.1 - Messaging Active');
});
