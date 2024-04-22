const playerModel = require("../models/player.model");

// Create and Save a new Player

exports.create = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      username = "Anonymous";
    }

    const player = new playerModel({
      username,
      score: 0,
      isPlaying: false,
    });

    await player.save();

    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({
      message:
        error.message || "Some error occurred while creating the Player.",
    });
  }
};
