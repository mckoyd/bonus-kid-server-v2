const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load input validation
const {validateRewardInput} = require('../../validation/reward');

// Load Task Model
const Reward = require('../../models/Reward');

// @route    GET api/v2/rewards
// @desc     Get all rewards
// @access   Private
router.get('/',passport.authenticate('jwt', {session: false}), (req, res) => {
  if(req.user.isParent){
    Reward.find({parentId: req.user.id})
      .sort({childId: 'asc'})
      .populate('childId', 'name')
      .then(reward => res.json(reward))
      .catch(err => res.json(err));
  } else {
    Reward.find({childId: req.user.id})
      .populate('parentId', 'name')
      .then(reward => res.json(reward))
      .catch(err => res.json(err));
  }
});

// @route    POST api/v2/rewards/
// @desc     Create or edit a reward (parents only)
// @access   Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const {errors, isValid} = validateRewardInput(req.body);
  if(!req.user.isParent){
    errors.notParent = 'Only parents can add rewards';
    return res.status(400).json(errors);
  }
  // Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  const {name, pointValue, childId} = req.body;
  const newReward = {
    name, 
    pointValue,
    childId,
    parentId: req.user.id
  };
  Reward.findOne({name, childId})
    .then(reward => {
      if(reward){
        Reward.findOneAndUpdate(
          {_id: reward.id},
          {$set: newReward},
          {new: true}
        )
          .then(reward => res.json(reward))
          .catch(err => res.status(400).json(err));
      } else {
        Reward.create(newReward)
          .then(reward => res.json(reward))
          .catch(err => res.status(400).json(err));
      }
    });
});

// @route    DELETE api/v2/rewards/:reward_id
// @desc     Deletes a task by id (parents only)
// @access   Private
router.delete('/:reward_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};
  const id = req.params.reward_id;
  if(!req.user.isParent){
    errors.notParent = 'User must be parent in order to delete a reward';
    res.status(400).json(errors);
  }
  Reward.findOneAndDelete({_id: id})
    .then(() => res.json({success: true, msg: 'Reward deleted'}))
    .catch(err => res.json(err));
});

module.exports = router;