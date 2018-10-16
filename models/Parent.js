const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

// Create Schema
const parentSchema = mongoose.Schema({
  name: { type: String, required: true },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isParent: { type: Boolean, required: true, default: true},
  childId: [
    { type: mongoose.Schema.ObjectId, ref: 'Child'}
  ],
  date: { type: Date, default: Date.now }
});

parentSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
  }
});

module.exports = mongoose.model('Parent', parentSchema);