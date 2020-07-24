const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userid:{
   type: String,
  },
  doi: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status:{
    type: Number,
  }
});

const complaint= mongoose.model("complaint", UserSchema);
module.exports = complaint;

