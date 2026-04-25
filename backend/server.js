const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.get('/inspect-dt', (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    const scriptPath = path.join(__dirname, 'inspect_dt.py');
    const pythonProcess = spawn('python', [scriptPath]);
    let resultData = '';
    pythonProcess.stdout.on('data', (d) => resultData += d.toString());
    pythonProcess.stderr.on('data', (d) => resultData += "\nERR: " + d.toString());
    pythonProcess.on('close', () => res.send(resultData));
});

// TEMP: Inspect risk models
app.get('/inspect-risk', (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    const scriptPath = path.join(__dirname, 'inspect_risk_models.py');
    const pythonProcess = spawn('python', [scriptPath]);
    let resultData = '';
    let errData = '';
    pythonProcess.stdout.on('data', (d) => resultData += d.toString());
    pythonProcess.stderr.on('data', (d) => errData += d.toString());
    pythonProcess.on('close', () => {
        res.type('text/plain').send(resultData || ('STDERR: ' + errData));
    });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api', require('./routes/mlRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
