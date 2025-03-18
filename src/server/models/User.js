    // models/User.js
    const mongoose = require('mongoose');

    const UserSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: {type: String, required:true },
      phone: {type: Number, required:true, max: 10, min:10},
      password: { type: String, required: true }
    });

    module.exports = mongoose.model('User', UserSchema);
