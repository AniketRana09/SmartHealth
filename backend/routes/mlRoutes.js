const express = require('express');
const router = express.Router();
const { predictDisease, predictGeneral, getGeneralSymptoms, getRiskInfo, analyzeRisk, chatbotResponse } = require('../controllers/mlController');
const { protect } = require('../middleware/authMiddleware');

// ML endpoints (protected routes)
router.post('/predict', protect, predictDisease);
router.post('/predict-general', protect, predictGeneral);
router.get('/predict-general/symptoms', protect, getGeneralSymptoms);
router.get('/debug-risk-info', (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    const scriptPath = path.join(__dirname, '..', 'predict_risk.py');
    const pythonProcess = spawn('python', [scriptPath, '--info']);
    let out = '';
    let err = '';
    pythonProcess.stdout.on('data', d => out += d.toString());
    pythonProcess.stderr.on('data', d => err += d.toString());
    pythonProcess.on('close', code => {
        res.json({ code, stdout: out, stderr: err });
    });
});
router.get('/risk/info', protect, getRiskInfo);
router.post('/risk', protect, analyzeRisk);
router.post('/chatbot', protect, chatbotResponse);

// TEMP TEST
router.get('/test-predict', (req, res) => {
    req.body = { symptoms: ["itching"] };
    predictGeneral(req, res);
});

module.exports = router;
