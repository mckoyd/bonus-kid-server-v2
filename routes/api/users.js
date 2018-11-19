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

// @route    GET api/v2/users/current_user
// @desc     Returns the current user
// @access   Private
router.get('/current_user', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};
  const {id} = req.user;
  if(req.user.isParent){
    Parent.findById(id)
      .populate('childId', ['name', 'username'])
      .then(parent => res.json(parent))
      .catch(err => {
        errors.mongooseErr = err;
        res.json(errors);
      });
  } else {
    Child.findById(id)
      .populate('parentId', ['name', 'username'])
      .then(child => res.json(child))
      .catch(err => {
        errors.mongooseErr = err;
        errors.noCurrentUser = 'There is no current user logged in';
        res.json(errors);
      });
  }
});

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
        return res.status(400).json(errors);
      } else {
        const newParent = {name, username, password, email};
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if(err) throw err;
            newParent.password = hash;
            Parent.create(newParent)
              .then(parent => res.json({parent}))
              .catch(err => console.log(err));
          });
        });
      }
    });
});

// @route    POST api/v2/users/login_parent
// @desc     Login parent user / Returning JWT
// @access   Public
router.post('/login_parent', (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body);
  // Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  const { username, password } = req.body;
  Parent.findOne({username})
    .populate('childId', ['name', 'username'])
    .then(parent => {
      if(!parent){
        errors.username = 'Username not found';
        return res.status(400).json(errors);
      }
      // Check password
      bcrypt.compare(password, parent.password)
        .then(isMatch => {
          if(isMatch){
            // Parent matched, create jwt payload
            const {name, username, email, id, isParent, childId} = parent;
            const payload = {name, username, email, id, isParent, childId};
            // Sign token
            jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRY}, (err, token) => {
              res.json({
                success: true,
                token
              });
            });
          } else {
            errors.password = 'Password incorrect';
            return res.status(400).json(errors);
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
        return res.status(400).json(errors);
      } else {
        const newChild = {name, username, password, parentId};
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if(err) throw err;
            newChild.password = hash;
            Child.create(newChild)
              .then(child => {
                Parent.findById(parentId)
                  .populate('childId', ['name'])
                  .then(parent => {
                    const updateParent = {
                      childId: [...parent.childId, child.id]
                    };
                    Parent.findByIdAndUpdate(parentId, updateParent, { new: true })
                      .populate('childId', ['name'])
                      .then(parent => res.json({parent, child}));
                  });
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
});

// @route    POST api/v2/users/login_child
// @desc     Login child user / Returning JWT
// @access   Public
router.post('/login_child', (req, res) => {
  const {errors, isValid} = validateLoginInput(req.body);
  // Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  const { username, password } = req.body;
  Child.findOne({username})
    .then(child => {
      if(!child){
        errors.username = 'Username not found';
        return res.status(400).json(errors);
      }
      // Check password
      bcrypt.compare(password, child.password)
        .then(isMatch => {
          if(isMatch){
            // Child matched, create jwt payload
            const {name, username, id, isParent} = child;
            const payload = {name, username, id, isParent};
            // Sign token
            jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRY}, (err, token) => {
              res.json({
                success: true,
                token
              });
            });
          } else {
            errors.password = 'Password incorrect';
            return res.status(400).json(errors);
          }
        });
    });
});

// @route    POST api/v2/users/refresh
// @desc     Refreshes auth token
// @access   Private
router.post('/refresh', passport.authenticate('jwt', {session: false}), (req, res) => {
  Parent.findById(req.user.id)
    .populate('childId', ['name', 'username'])
    .then(parent => {
      if(!parent){
        errors.id = 'User Id not found';
        return res.status(400).json(errors);
      }
      const {name, username, email, id, isParent, childId} = parent;
      const payload = {name, username, email, id, isParent, childId};
            // Sign token
      jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRY}, (err, token) => {
        res.json({
          success: true,
          token
        });
      });
    });
});

// @route    DELETE api/v2/users
// @desc     Deletes the current user
// @access   Private
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const user = req.user.id, errors = {}, success = {};
  if(!req.user.isParent){
    errors.unauthorized = 'Only parents can delete accounts';
    return res.status(404).json(errors);
  } else {
    console.log(req.user.childId)
    req.user.childId.map(id => Child.findOneAndDelete({_id: id}))
    Parent.findOneAndDelete({_id: user})
      .then(() => res.json({parentDeleted: true, success}))
      .catch(err => res.json(err))
  }
});

module.exports = router;