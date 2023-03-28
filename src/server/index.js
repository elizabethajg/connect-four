// server/index.js

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Play = require('./play');
const connectDb = require('./db');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3002;
const games = new Map();
const players = ['red', 'yellow']

const createNewGame = async (db) => {
  const gameId = (await db.collection('games').insertOne({})).insertedId.toString();
  const game = new Play(gameId, db);
  games.set(gameId, game);
  return gameId;
};

(async () => {
  try {
    await nextApp.prepare();
  } catch (error) {
    console.error('Error during app initialization:', error);
  }

  app.all('*', (req, res) => {
    return handle(req, res);
  });
  const db = await connectDb();
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Server started successfully`);
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('createGame', async () => {
      const gameId = await createNewGame(db);
      socket.join(gameId);
      socket.emit('gameCreated', { gameId, board: games.get(gameId).board});
    });

    // `socket.emit('startGame', ...)` sends the 'startGame' event to the specific client (socket) that initiated the request.
    // `socket.to(gameId).emit('startGame', ...)` sends the 'startGame' event to all clients in the specified room (gameId) except the sender (socket) that initiated the request.

    socket.on('joinGame', async (gameId) => {
        const game = games.get(gameId);
        if (game) {
          socket.join(gameId);
          socket.emit('startGame', { gameId, board: game.board, playerColor: players[1], currentPlayer: game.currentPlayer});
          socket.to(gameId).emit('startGame', { gameId, board: game.board, playerColor: players[0], currentPlayer: game.currentPlayer });
          io.to(gameId).emit('move', {board: game.board, currentPlayer: game.currentPlayer})
        } else {
          socket.emit("gameNotFound");
        }
      });

    socket.on('move', async (data) => {
      const game = games.get(data.gameId);
  
      if (game && (await game.placePiece(data.col))) {
        io.to(data.gameId).emit('move', {
          board: game.board,
          currentPlayer: game.currentPlayer,
        });

        if (game.gameOver) {
          io.to(data.gameId).emit('gameOver', { winner: game.winner });
          games.delete(data.gameId);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
})();

//end of server/index.js

