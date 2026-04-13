const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Session = require('../models/Session');

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
      link: `http://localhost:5173/chat/${sessionId}`,
      message: 'Session created successfully. Use the code or link to join.',
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session.',
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

module.exports = router;
