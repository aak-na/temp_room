const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');
const Message = require('../models/Message');

// POST /api/sessions - Create a new temporary session
router.post('/sessions', async (req, res) => {
  try {
    const sessionId = uuidv4();
    
    const newSession = new Session({
      sessionId,
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      sessionId,
      link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat/${sessionId}`,
      message: 'Session created successfully. Use the code or link to join.',
    });
  } catch (error) {
    console.error('CRITICAL ERROR during session creation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session.',
      debug: error.message, // Temporarily expose for debugging
    });
  }
});

// GET /api/sessions/:sessionId - Check if session exists
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ sessionId, isActive: true });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or expired.',
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

// GET /api/sessions/:sessionId/messages - Fetch message history
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.',
    });
  }
});

// DELETE /api/sessions/:sessionId - Terminate session
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Deactivate the session
    await Session.findOneAndUpdate({ sessionId }, { isActive: false });
    
    // Ephemeral: Delete all messages for this session
    await Message.deleteMany({ sessionId });

    res.status(200).json({
      success: true,
      message: 'Session terminated and cleared.',
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to terminate session.',
    });
  }
});

module.exports = router;
