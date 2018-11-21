const express = require('express');
const router = express.Router();
const passport = require('passport');

// Load input validation
const {validateTaskInput} = require('../../validation/task');

// Load Task Model
const Task = require('../../models/Task');
const Child = require('../../models/Child');

// @route    GET api/v2/tasks
// @desc     Get all tasks
// @access   Private
router.get('/',passport.authenticate('jwt', {session: false}), (req, res) => {
  if(req.user.isParent){
    Task.find({parentId: req.user.id})
      .sort({childId: 'asc'})
      .populate('childId', 'name')
      .then(task => res.json(task))
      .catch(err => res.json(err));
  } else {
    Task.find({childId: req.user.id})
      .populate('parentId', 'name')
      .then(task => res.json(task))
      .catch(err => res.json(err));
  }
});

// @route    GET api/v2/tasks
// @desc     Get all tasks for one child
// @access   Private
router.get('/:child_id',passport.authenticate('jwt', {session: false}), (req, res) => {
  if(req.user.isParent){
    Task.find({childId: req.params.child_id})
      .sort({childId: 'asc'})
      .populate('childId', 'name')
      .populate('parentId', 'name')
      .then(task => res.json(task))
      .catch(err => res.json(err));
  } else {
    Task.find({childId: req.user.id})
      .populate('parentId', 'name')
      .then(task => res.json(task))
      .catch(err => res.json(err));
  }
});

// @route    POST api/v2/tasks/
// @desc     Create or edit a task (parents only)
// @access   Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  const {errors, isValid} = validateTaskInput(req.body);
  if(!req.user.isParent){
    errors.notParent = 'Only parents can add tasks';
    return res.status(400).json(errors);
  }
  // Check validation
  if(!isValid){
    return res.status(400).json(errors);
  }
  const {name, pointValue, childId} = req.body;
  const newTask = {
    name, 
    pointValue,
    childId,
    parentId: req.user.id
  };
  Task.create(newTask)
    .then(task => {
      Child.findById(childId)
        .then(child => {
          console.log(child)
          const updatedTasks = {tasks: [...child.tasks, task.id]}
          Child.findByIdAndUpdate(
            childId,
            updatedTasks,
            {new: true}
          )
            .then(child => res.json({child, task}))
        })
        .catch(err => console.log(err))
    })
    .catch(err => res.status(400).json(err));
});

// @route    POST api/v2/tasks/:task_id
// @desc     Edits a task by id (parents only)
// @access   Private
router.post('/:task_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {}, updatedTask = {};
  const id = req.params.task_id;
  const { name, pointValue, childId } = req.body;
  name!==undefined ? updatedTask.name = name : 
    pointValue!==undefined ? updatedTask.pointValue = pointValue : 
      errors.noValues = 'Nothing to edit';
  if(!req.user.isParent){
    errors.notParent = 'User must be parent in order to edit a task';
    res.status(400).json(errors);
  } else if(errors.noValues) {
    res.status(400).json(errors);
  }
  Task.findByIdAndUpdate(id, updatedTask, {new: true})
    .then(task => res.json(task))
    .catch(err => res.json(err))
});

// @route    DELETE api/v2/tasks/:task_id
// @desc     Deletes a task by id (parents only)
// @access   Private
router.delete('/:task_id', passport.authenticate('jwt', {session: false}), (req, res) => {
  const errors = {};
  const id = req.params.task_id;
  if(!req.user.isParent){
    errors.notParent = 'User must be parent in order to delete a task';
    res.status(400).json(errors);
  }
  Task.findOneAndDelete({_id: id})
    .then(() => res.json({success: true, msg: 'Task deleted'}))
    .catch(err => res.json(err));
});

module.exports = router;