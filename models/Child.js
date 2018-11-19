const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

// Create Schema
const childSchema = mongoose.Schema({
  name: {type: String, required: true},
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: {type: String, required: true},
  isParent: { type: Boolean, required: true, default: false},
  parentId: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'Parent', 
    required: true
  },
  totalPoints: {type: Number, required: true, default: 0},
  currentPoints: {type: Number, required: true, default: 0},
  tasks: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Task'
    } 
  ],
  rewards: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Reward'
    }
  ],
  date: {type: Date, default: Date.now}
});

childSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

module.exports = mongoose.model('Child', childSchema);