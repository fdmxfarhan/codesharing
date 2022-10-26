var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  studentNumber: String,
  phone: String,
  fullname: String,
  role: String,
  sex: String,
  dateOfRegisteration: Date,
  profileCompeleted: Boolean,
  smsCode: String,
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
