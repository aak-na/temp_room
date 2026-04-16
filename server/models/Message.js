const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  replyTo: {
    text: String,
    sender: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
