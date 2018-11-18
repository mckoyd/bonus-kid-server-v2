require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const PORT = process.env.PORT || 5000;
const { MONGODB_URI, CLIENT_ORIGIN } = require('./config/keys');

const usersRouter = require('./routes/api/users');
const tasksRouter = require('./routes/api/tasks');
const rewardsRouter = require('./routes/api/rewards');

app.use(cors({
  origin: CLIENT_ORIGIN
}))

// Body parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// DB Config and connect
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Passport middlware
app.use(passport.initialize());
require('./config/passport')(passport);

// Test Get for Deployment
app.get('/', (req, res) => res.json({msg: 'Deployment successful'}));

// Use Routes
app.use('/api/v2/users', usersRouter);
app.use('/api/v2/tasks', tasksRouter);
app.use('/api/v2/rewards', rewardsRouter);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

