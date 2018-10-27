const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

// Create Schema
const taskSchema = mongoose.Schema({
  name: { type: String, required: true },
  pointValue: {type: Number, required: true},
  startDate: { type: Date, default: Date.now },
  expDate: {type: Date, default: new Date(+new Date() + 7*24*60*60*1000)},
  received: {type: Boolean, required: true, default: false},
  approved: {type: Boolean, required: true, default: false}, 
  childId: {type: mongoose.Schema.ObjectId, ref: 'Child', required: true},
  parentId: {type: mongoose.Schema.ObjectId, ref: 'Parent', required: true}
});

taskSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Task', taskSchema);