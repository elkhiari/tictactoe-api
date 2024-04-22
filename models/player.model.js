const mongoose = require("mongoose");

const PlayerSchema = mongoose.Schema({
  username: String,
  score: Number,
  isPlaying: Boolean,
});

module.exports = mongoose.model("Player", PlayerSchema);
