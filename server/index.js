const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const sessionRoutes = require('./routes/sessionRoutes');
const Session = require('./models/Session');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

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
  socket.on('join-session', async (sessionId) => {
    try {
      // Logic could include checking if sessionId exists in DB
      socket.join(sessionId);
      console.log(`User ${socket.id} joined room: ${sessionId}`);
      
      // Update last activity in DB
      await Session.findOneAndUpdate({ sessionId }, { lastActivity: Date.now() });

      socket.emit('joined', { sessionId, message: `Successfully joined room ${sessionId}` });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room.');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
