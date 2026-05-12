const User = require('../models/User');
const PredictionHistory = require('../models/PredictionHistory');

// @desc    Get user data
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                gender: user.gender,
                weight: user.weight,
                height: user.height,
                bmi: user.bmi,
                bloodGroup: user.bloodGroup
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.age = req.body.age || user.age;
            user.gender = req.body.gender || user.gender;
            
            if (req.body.weight !== undefined) user.weight = req.body.weight;
            if (req.body.height !== undefined) user.height = req.body.height;
            if (req.body.bmi !== undefined) user.bmi = req.body.bmi;
            if (req.body.bloodGroup !== undefined) user.bloodGroup = req.body.bloodGroup;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                age: updatedUser.age,
                gender: updatedUser.gender,
                weight: updatedUser.weight,
                height: updatedUser.height,
                bmi: updatedUser.bmi,
                bloodGroup: updatedUser.bloodGroup
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user prediction history
// @route   GET /api/user/history
// @access  Private
const getPredictionHistory = async (req, res) => {
    try {
        const history = await PredictionHistory.find({ user: req.user.id }).sort({ date: -1 });
        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error fetching history' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getPredictionHistory
};
