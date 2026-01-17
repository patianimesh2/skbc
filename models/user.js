const mongoose = require('mongoose');

const MealRecordSchema = new mongoose.Schema({
  date: Date,
  mealType: String, // 'morning' or 'night'
  on: Boolean
});

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  mobile: String,
  password: String,
  dept: String,
  roomNo: Number,
  roommate: String,
  address: String,
  movedIn: Date,
  expiry: Date,
  mealRecords: [MealRecordSchema]
});

module.exports = mongoose.model('User', UserSchema);
