require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const PORT = process.env.PORT || 5000;

const usersRouter = require('./routes/api/users');
const profilesRouter = require('./routes/api/profiles');

// Body parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// DB Config and connect
const { MONGODB_URI } = require('./config/keys');
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
app.use('/api/v2/profiles', profilesRouter);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

