const { spawn } = require('child_process');
const path = require('path');

// @desc    Predict Diabetes Risk (Actual ML Model)
// @route   POST /api/predict
// @access  Private
const predictDisease = async (req, res) => {
    try {
        const inputData = JSON.stringify(req.body);

        // Path to the python script
        const scriptPath = path.join(__dirname, '..', 'predict_diabetes.py');

        // Spawn python process
        const pythonProcess = spawn('python', [scriptPath]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorData}`);
                return res.status(500).json({ success: false, message: 'Error running prediction model', error: errorData });
            }

            try {
                // Find all jsons in the output in case there's extra print statements.
                // Or just parse directly if we expect clean output
                const resultJson = JSON.parse(resultData);
                if (resultJson.error) {
                    return res.status(500).json({ success: false, message: 'Model Error', error: resultJson.error });
                }
                res.status(200).json({ success: true, data: resultJson });
            } catch (err) {
                console.error("Failed to parse python script output:", resultData);
                res.status(500).json({ success: false, message: 'Invalid prediction output', error: err.message });
            }
        });

        // Write the body to python script stdin
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Predict General Disease Risk (Actual ML Model)
// @route   POST /api/predict-general
// @access  Private
const predictGeneral = async (req, res) => {
    try {
        const inputData = JSON.stringify(req.body);
        const scriptPath = path.join(__dirname, '..', 'predict_general.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let resultData = '';
        let errorData = '';
        console.log("Symptoms received by Express:", JSON.stringify(req.body.symptoms));
        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorData}`);
                return res.status(500).json({ success: false, message: 'Error running prediction model', error: errorData });
            }

            try {
                const resultJson = JSON.parse(resultData);
                if (resultJson.error) {
                    return res.status(500).json({ success: false, message: 'Model Error', error: resultJson.error });
                }
                res.status(200).json({ success: true, data: resultJson });
            } catch (err) {
                console.error("Failed to parse python script output:", resultData);
                res.status(500).json({ success: false, message: 'Invalid prediction output', error: err.message });
            }
        });

        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get symptoms list for General Disease Model
// @route   GET /api/predict-general/symptoms
// @access  Private
const getGeneralSymptoms = async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '..', 'predict_general.py');
        const pythonProcess = spawn('python', [scriptPath, '--info']);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorData}`);
                return res.status(500).json({ success: false, message: 'Error fetching symptoms', error: errorData });
            }

            try {
                const resultJson = JSON.parse(resultData);
                if (resultJson.error) {
                    return res.status(500).json({ success: false, message: 'Model Error', error: resultJson.error });
                }
                res.status(200).json({ success: true, data: resultJson.symptoms });
            } catch (err) {
                console.error("Failed to parse python script output:", resultData);
                res.status(500).json({ success: false, message: 'Invalid python output format', error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get Risk Model Info (features + classes)
// @route   GET /api/risk/info
// @access  Private
const getRiskInfo = async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '..', 'predict_risk.py');
        const pythonProcess = spawn('python', [scriptPath, '--info']);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`predict_risk.py --info exited with code ${code}: ${errorData}`);
                return res.status(500).json({ success: false, message: 'Error fetching risk model info', error: errorData });
            }
            try {
                const jsonStr = resultData.substring(resultData.indexOf('{'), resultData.lastIndexOf('}') + 1);
                const resultJson = JSON.parse(jsonStr);
                if (resultJson.error) {
                    return res.status(500).json({ success: false, message: 'Model Error', error: resultJson.error });
                }
                res.status(200).json({ success: true, data: resultJson });
            } catch (err) {
                console.error('Failed to parse risk model info output:', resultData);
                res.status(500).json({ success: false, message: 'Invalid python output', error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Analyze Risk using Real Random Forest ML Model
// @route   POST /api/risk
// @access  Private
const analyzeRisk = async (req, res) => {
    try {
        const inputData = JSON.stringify(req.body);
        const scriptPath = path.join(__dirname, '..', 'predict_risk.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`predict_risk.py exited with code ${code}: ${errorData}`);
                return res.status(500).json({ success: false, message: 'Error running risk analysis model', error: errorData });
            }

            try {
                const jsonStr = resultData.substring(resultData.indexOf('{'), resultData.lastIndexOf('}') + 1);
                const resultJson = JSON.parse(jsonStr);
                if (resultJson.error) {
                    return res.status(500).json({ success: false, message: 'Model Error', error: resultJson.error, trace: resultJson.trace });
                }
                res.status(200).json({ success: true, data: resultJson });
            } catch (err) {
                console.error('Failed to parse risk prediction output:', resultData);
                res.status(500).json({ success: false, message: 'Invalid risk prediction output', error: err.message });
            }
        });

        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Chatbot Response via RAG
// @route   POST /api/chatbot
// @access  Private
const chatbotResponse = async (req, res) => {
    try {
        const http = require('http');
        const postData = JSON.stringify(req.body);
        const options = {
            hostname: '127.0.0.1',
            port: 5001,
            path: '/chatbot',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const request = http.request(options, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                if (response.statusCode === 200) {
                    try {
                        const json = JSON.parse(data);
                        res.status(200).json({ success: true, data: json });
                    } catch (e) {
                        res.status(500).json({ success: false, message: 'Invalid JSON from Python server', error: data });
                    }
                } else {
                    res.status(response.statusCode).json({ success: false, message: 'Python server error', error: data });
                }
            });
        });

        request.on('error', (e) => {
            console.error(`Problem with request: ${e.message}`);
            res.status(500).json({ success: false, message: 'Could not connect to Python chatbot server (is it running on port 5001?)', error: e.message });
        });

        request.write(postData);
        request.end();

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get Heart Model Info (features)
// @route   GET /api/predict-heart/info
// @access  Private
const getHeartInfo = async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '..', 'predict_heart.py');
        const pythonProcess = spawn('python', [scriptPath, '--info']);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`predict_heart.py --info exited with code ${code}: ${errorData}`);
                return res.status(500).json({ success: false, message: 'Error fetching heart model info', error: errorData });
            }
            try {
                const jsonStr = resultData.substring(resultData.indexOf('{'), resultData.lastIndexOf('}') + 1);
                const resultJson = JSON.parse(jsonStr);
                if (resultJson.error) {
                    return res.status(500).json({ success: false, message: 'Model Error', error: resultJson.error });
                }
                res.status(200).json({ success: true, data: resultJson });
            } catch (err) {
                console.error('Failed to parse heart model info output:', resultData);
                res.status(500).json({ success: false, message: 'Invalid python output', error: err.message });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Predict Heart Disease Risk
// @route   POST /api/predict-heart
// @access  Private
const predictHeart = async (req, res) => {
    try {
        const inputData = JSON.stringify(req.body);
        const scriptPath = path.join(__dirname, '..', 'predict_heart.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`predict_heart.py exited with code ${code}: ${errorData}`);
                return res.status(500).json({ success: false, message: 'Error running heart prediction model', error: errorData });
            }

            try {
                const jsonStr = resultData.substring(resultData.indexOf('{'), resultData.lastIndexOf('}') + 1);
                const resultJson = JSON.parse(jsonStr);
                if (resultJson.error) {
                    return res.status(500).json({ success: false, message: 'Model Error', error: resultJson.error, trace: resultJson.trace });
                }
                res.status(200).json({ success: true, data: resultJson });
            } catch (err) {
                console.error('Failed to parse heart prediction output:', resultData);
                res.status(500).json({ success: false, message: 'Invalid prediction output', error: err.message });
            }
        });

        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

module.exports = {
    predictDisease,
    predictGeneral,
    getGeneralSymptoms,
    getRiskInfo,
    analyzeRisk,
    chatbotResponse,
    getHeartInfo,
    predictHeart
};
