const {Strategy: jwtStrategy, ExtractJwt} = require('passport-jwt');
const mongoose = require('mongoose');
const Parent = mongoose.model('Parent');
const Child = mongoose.model('Child');
const {JWT_SECRET} = require('./keys');

const opts = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  algorithms: ['HS256']
};

module.exports = passport => {
  passport.use(new jwtStrategy(opts, (payload, done) => {
    if(payload.isParent){
      Parent.findById(payload.id)
        .then(user => {
          if(user){
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    } else {
      Child.findById(payload.id)
        .then(user => {
          if(user){
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    }
    
  }));
};