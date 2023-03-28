require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const GameLogic = require("./game");
const connectDb = require("./db");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3002;
const games = new Map();
const players = ["Red", "Yellow"];

const createNewGame = async (db) => {
  const gameId = (
    await db.collection("games").insertOne({})
  ).insertedId.toString();
  const game = new GameLogic(gameId, db);
  games.set(gameId, game);
  return gameId;
};

(async () => {
  try {
    await nextApp.prepare();
  } catch (error) {
    console.error("Error during app initialization:", error);
  }

  app.all("*", (req, res) => {
    return handle(req, res);
  });
  const db = await connectDb();
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Server started successfully`);
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("createGame", async () => {
      const gameId = await createNewGame(db);
      socket.join(gameId);
      socket.emit("gameCreated", { gameId, board: games.get(gameId).board });
    });

    // `socket.emit('startGame', ...)` sends the 'startGame' event to the specific client (socket) that initiated the request.
    // `socket.to(gameId).emit('startGame', ...)` sends the 'startGame' event to all clients in the specified room (gameId) except the sender (socket) that initiated the request.

    socket.on("joinGame", async (gameId) => {
      const game = games.get(gameId);
      if (game) {
        socket.join(gameId);
        socket.emit("startGame", {
          gameId,
          board: game.board,
          playerColor: players[1],
          currentPlayer: game.currentPlayer,
        });
        socket
          .to(gameId)
          .emit("startGame", {
            gameId,
            board: game.board,
            playerColor: players[0],
            currentPlayer: game.currentPlayer,
          });
        io.to(gameId).emit("move", {
          board: game.board,
          currentPlayer: game.currentPlayer,
        });
      } else {
        socket.emit("gameNotFound");
      }
    });

    socket.on("move", async (data) => {
      const game = games.get(data.gameId);

      if (game && (await game.placePiece(data.col))) {
        io.to(data.gameId).emit("move", {
          board: game.board,
          currentPlayer: game.currentPlayer,
        });

        if (game.gameOver) {
          io.to(data.gameId).emit("gameOver", { winner: game.winner });
          games.delete(data.gameId);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
})();
// //end of server/index.js

// It seems like you're using the 'fs' module from Node.js in a Next.js frontend file. The 'fs' module is not available in the browser environment. You need to move your server logic to a separate API route, and use the 'fs' module only in the server-side code.

// 1. Create a folder called 'api' inside your 'pages' folder.
// 2. Move your server logic into a new file within the 'api' folder, like 'server.js'.
// 3. Export the function containing your server logic as a default export in 'server.js'.
// 4. Update your frontend code to fetch data from the new API route instead of using 'fs'.

// Here's an example of how to create an API route in Next.js:

// // pages/api/server.js

//   // Your server-side logic here

// And in your frontend code, fetch data from the API route like this:

// // pages/index.js
// const getData = async () => {
//   const response = await fetch('/api/server');
//   const data = await response.json();
//   // Use the fetched data
// };

// getData();


