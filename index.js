const express = require('express');
const app = express();
const verify = require('./routes/verifyToken');
const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => console.log('Connected to Database'));

const authRouter = require('./routes/auth');
app.use(express.json());
app.use('/api/user', authRouter);

app.get('/api/posts', verify, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json(user)
});

app.listen(port, () => console.log(`Listening on port ${port}`));