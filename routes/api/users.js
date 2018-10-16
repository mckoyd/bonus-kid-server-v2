const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require('../../config/keys');
const passport = require('passport');

// Load input validation
const {validateRegisterInput} = require('../../validation/register');
const {validateLoginInput} = require('../../validation/login');

// Load Parent and Child models
const Parent = require('../../models/Parent');
const Child = require('../../models/Child');

// @route    GET api/v2/users/test
// @desc     Tests parent user route
// @access   Public
router.get('/test', (req, res) => res.json({
  msg: 'parent router works'
}));

// @route    POST api/v2/users/register_parent
// @desc     Registers parent user
// @access   Public
router.post('/register_parent', (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);
  // Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }

  const {name, username, password, email} = req.body;
  Parent.findOne({username})
    .then(parent => {
      if(parent){
        errors.username = 'Username already exists.';
        return res.status(400).json({errors});
      } else {
        const newParent = {name, username, password, email};
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if(err) throw err;
            newParent.password = hash;
            Parent.create(newParent)
              .then(parent => res.json(parent))
              .catch(err => console.log(err));
          });
        });
      }
    });
});

// @route    POST api/v2/users/login_parent
// @desc     Login parent user / Returning JWT
// @access   Public
router.post('/parent_login', (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body);
  // Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  const { username, password } = req.body;

  // Find parent by username
  Parent.findOne({username})
    .then(parent => {
      if(!parent){
        errors.username = 'Username not found';
        return res.status(400).json({errors});
      }
      // Check password
      bcrypt.compare(password, parent.password)
        .then(isMatch => {
          if(isMatch){
            // Parent matched, create jwt payload
            const {name, username, email, id, isParent} = parent;
            const payload = {name, username, email, id, isParent};
            // Sign token
            jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRY}, (err, token) => {
              res.json({
                success: true,
                token: `Bearer ${token}`
              });
            });
          } else {
            errors.password = 'Password incorrect';
            return res.status(400).json({errors});
          }
        });
    });
});

// @route    POST api/v2/users/register_child
// @desc     Registers child user
// @access   Public
router.post('/register_child', passport.authenticate('jwt', {session: false}), (req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);
  // Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  const {name, username, password} = req.body;
  const parentId = req.user.id;
  Child.findOne({username})
    .then(child => {
      if(child){
        errors.username = 'Username already exists.';
        return res.status(400).json({errors});
      } else {
        const newChild = {name, username, password, parentId};
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if(err) throw err;
            newChild.password = hash;
            Child.create(newChild)
              .then(child => {
                Parent.findById(parentId)
                  .then(parent => {
                    const updateParent = {
                      childId: [...parent.childId, child.id]
                    };
                    Parent.findByIdAndUpdate(parentId, updateParent, { new: true })
                      .then(parent => res.json({parent, child}));
                  });
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
});

// @route    GET api/v2/users/current_user
// @desc     Returns the current user
// @access   Private
router.get('/current_user', passport.authenticate('jwt', {session: false}), (req, res) => {
  const {id, name, email, date, username, childId} = req.user;
  res.json({id, name, email, username, date, childId});
});



module.exports = router;