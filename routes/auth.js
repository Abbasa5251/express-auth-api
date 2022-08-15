const router = require('express').Router();
const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { userLoginValidation, userRegisterValidation } = require('../validation');

// Register User Route
router.post('/register', async (req, res) => {
    // Validate the data
    const { error } = userRegisterValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Check If User Already Exists
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send({ message: 'Email Already Exist' });

    // Hash Password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new User
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    })
    try {
        const newUser = await user.save();
        res.send({
            user: user._id,
            message: 'User Registered'
        });
    }
    catch (err) {
        res.status(400).send(err);
    }
});

// Login User Route
router.post('/login', async (req, res) => {
    // Validate Data
    const { error } = userLoginValidation(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Check for User in Database
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: 'Email doesn\'t Exist' });

    // Compare Password with hashed Password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ message: 'Password is Wrong' });

    // Create JWT Authentication Token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send({
        message: 'Login Successful',
        auth_token: token,
    });
});

module.exports = router;