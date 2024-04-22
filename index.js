const express = require("express");
const cors = require("cors");

const { app, server } = require("./socket/socket");

app.use(cors());
require("dotenv").config();
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/players", require("./routes/player.route"));
app.use("/api/games", require("./routes/game.route"));

server.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
