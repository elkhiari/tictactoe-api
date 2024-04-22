// tic tac toe game model

const mongoose = require("mongoose");

const GameSchema = mongoose.Schema({
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
  board: [[String]],
  turn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
  },
  status: String,
  winBoard: [Number],
  playersReady: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },
  ],
});

module.exports = mongoose.model("Game", GameSchema);
