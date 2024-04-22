const gameModel = require("../models/game.model");
const playerModel = require("../models/player.model");
const { getSocket, io } = require("../socket/socket");

// Create and Save a new Game with invite link and player1

exports.create = async (req, res) => {
  try {
    const { players } = req.body;
    if (!players) {
      return res.status(400).json({
        message: "Players can not be empty",
      });
    }

    const game = new gameModel({
      players,
      status: "waiting",
      board: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
    });

    await game.save();

    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Some error occurred while creating the Game.",
    });
  }
};

exports.ready = async (req, res) => {
  try {
    const { id } = req.params;
    const { player } = req.body;

    // Find the game by ID
    const game = await gameModel.findById(id);

    // Check if the game exists
    if (!game) {
      return res.status(404).json({
        message: "Game not found",
      });
    }

    // Check if the game is in the "waiting" status
    if (game.status !== "waiting") {
      return res.status(400).json({
        message: "Game is not waiting for players",
      });
    }

    // Check if the player is part of the game
    if (!game.players.includes(player)) {
      return res.status(400).json({
        message: "You are not in the game",
      });
    }

    // Check if the game is already full
    if (game.playersReady.length === 2) {
      return res.status(400).json({
        message: "Game is full",
      });
    }

    // Toggle player readiness
    if (game.playersReady.includes(player)) {
      game.playersReady = game.playersReady.filter(
        (p) => p.toString() !== player
      );
    } else {
      game.playersReady.push(player);
    }

    // If both players are ready, start the game
    if (game.playersReady.length === 2) {
      game.status = "playing";
      game.turn = game.players[0];
    }

    // Save the updated game state
    await game.save();
    await sendGame(game, player);
    // Return the updated game data
    res.status(200).json({ game });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: error.message || "Some error occurred while readying the Game.",
    });
  }
};

exports.join = async (req, res) => {
  try {
    const { id } = req.params;
    const { player } = req.body;

    // Check if player data is provided
    if (!player) {
      return res.status(400).json({
        message: "Player data is required",
      });
    }

    // Find the game by ID
    const game = await gameModel.findById(id);

    // Check if the game exists
    if (!game) {
      return res.status(404).json({
        message: "Game not found",
      });
    }

    // Check if the player is already in the game
    if (game.players.includes(player)) {
      return res.status(200).json({ game });
    }

    // Check if the game is in the "waiting" status
    if (game.status !== "waiting") {
      return res.status(400).json({
        message: "Game is not open for new players",
      });
    }

    // Add the player to the game
    game.players.push(player);

    // Save the updated game state
    await game.save();
    await sendGame(game, player);

    // Return the updated game data
    res.status(200).json({ game });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: error.message || "An error occurred while joining the game",
    });
  }
};

exports.play = async (req, res) => {
  try {
    const { id } = req.params;
    const { player, x, y } = req.body;

    // Find the game by ID
    const game = await gameModel.findById(id);

    // Check if the game exists
    if (!game) {
      return res.status(404).json({
        message: "Game not found",
      });
    }

    // Check if the game is in the "playing" status
    if (game.status !== "playing") {
      return res.status(400).json({
        message: "Game is not currently being played",
      });
    }

    // Check if it's the player's turn
    if (game.turn.toString() !== player) {
      return res.status(400).json({
        message: "It's not your turn",
      });
    }

    // Check if the move is valid
    if (game.board[x][y] !== "") {
      return res.status(400).json({
        message: "Invalid move, the cell is already occupied",
      });
    }

    // Update the game board with the player's move
    game.board[x][y] = player;

    // Check if the move results in a win
    const winBoards = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    // Iterate through winBoards to check for a win
    for (const winBoard of winBoards) {
      const [a, b, c] = winBoard;
      if (
        game.board[Math.floor(a / 3)][a % 3] === player &&
        game.board[Math.floor(b / 3)][b % 3] === player &&
        game.board[Math.floor(c / 3)][c % 3] === player
      ) {
        // Update game status and winner
        game.status = "finished";
        game.winner = player;
        // save winBord to highlight the winning row

        game.winBoard = winBoard;
        break;
      }
    }

    // Check for a draw
    const isDraw = game.board.every((row) => row.every((cell) => cell !== ""));
    if (game.status === "playing" && isDraw) {
      game.status = "finished";
    }

    // Update turn if the game is still ongoing
    if (game.status === "playing") {
      game.turn = game.players.find((p) => p.toString() !== player);
    }

    // Save the updated game state
    await game.save();
    await sendGame(game, player);
    res.status(200).json({ game });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: error.message || "An error occurred while playing the game",
    });
  }
};

const sendGame = async (game, player) => {
  const receiverId = getSocket(
    player == game.players[0] ? game.players[1] : game.players[0]
  );

  if (receiverId) {
    io.to(receiverId).emit("game", game);
  }
};
