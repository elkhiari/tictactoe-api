const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userSocket = {};

const getSocket = (userId) => {
  return userSocket[userId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId !== undefined) userSocket[userId] = socket.id;
  socket.on("disconnect", () => {
    delete userSocket[userId];
  });
});

module.exports = { app, server, io, getSocket };
