const mongoose = require('mongoose');

const predictionHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Disease Prediction', 'Risk Analysis'],
        required: true
    },
    inputData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    resultData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PredictionHistory', predictionHistorySchema);
