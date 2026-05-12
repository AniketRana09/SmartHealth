const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    messages: [{
        text: {
            type: String,
            required: true
        },
        isBot: {
            type: Boolean,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
