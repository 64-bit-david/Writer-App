const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  googleId: {
    type: String,
    required: true
  },
  username: {
    type: String,
  }
  //comments?
},
  { timestamps: true });

module.exports = mongoose.model('User', userSchema);