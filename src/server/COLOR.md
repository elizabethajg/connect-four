These snippets are found in
components/Game.js

```js
socket.on("assignColor", (color) => {
        setPlayerColor(color);
        console.log(color, playerColor)
      });

socket.on('gameStart', (currentPlayer) => {
        setCurrentPlayer(currentPlayer);
        setMessage(`Game started! ${currentPlayer}'s turn. Your color is ${playerColor}`);
      });
```

This snippet is found in server/index.js

```js
socket.on('joinGame', (gameId) => {
      const players = ['red', 'yellow'];
      const playerOneColor = players[Math.floor(Math.random() * players.length)];
      const playerTwoColor = playerOneColor === 'red' ? 'yellow' : 'red';
      socket.emit('assignColor', playerTwoColor);
      socket.broadcast.to(gameId).emit('assignColor', playerOneColor);
      if (games.has(gameId)) {
        socket.join(gameId);
        socket.emit('gameJoined', { gameId, board: games.get(gameId).board });
        io.to(gameId).emit('gameStart', games.get(gameId).currentPlayer);
        
      } else {
        socket.emit('gameNotFound');
      }
    });
```


Why is it the case that playerColor returns null on 'gameStart'?

`setMessage` is called before `setPlayerColor` has updated the state.

```js
socket.on("assignColor", (color) => {
  setPlayerColor(color);
  socket.on('gameStart', (currentPlayer) => {
    setCurrentPlayer(currentPlayer);
    setMessage(`Game started! ${currentPlayer}'s turn. Your color is ${color}`);
  });
});

socket.on("gameCreated", ({ gameId, board }) => {
        setGameId(gameId);
        setBoard(board);
        console.log('Game created')
        setMessage(`Game created with ID: ${gameId}. Waiting for player 2...`);
      });

      socket.on("gameJoined", ({ gameId, board }) => {
        setGameId(gameId);
        setBoard(board);
        setMessage("Player 2 joined!");
      });
```

socket.on("assignColor", (color) => {
  setPlayerColor(color);
});

socket.on("gameCreated", ({ gameId, board }) => {
  setGameId(gameId);
  setBoard(board);
  setMessage(`Game created with ID: ${gameId}. Waiting for player 2...`);
});

socket.on("gameJoined", ({ gameId, board }) => {
  setGameId(gameId);
  setBoard(board);
  setMessage("Player 2 joined!");
});

socket.on('gameStart', (currentPlayer) => {
  setCurrentPlayer(currentPlayer);
  setMessage(`Game started! ${currentPlayer}'s turn. Your color is ${playerColor}`);
});

Move the 'gameStart' event listener inside the 'assignColor' event listener like this:

```js
socket.on("assignColor", (color) => {
  setPlayerColor(color);
  socket.on('gameStart', (currentPlayer) => {
    setCurrentPlayer(currentPlayer);
    setMessage(`Game started! ${currentPlayer}'s turn. Your color is ${color}`);
  });
});

I apologize for the confusion. Let's use a useEffect with a dependency on playerColor to solve the issue:

```js
useEffect(() => {
  if (playerColor) {
    setMessage(`Game started! ${currentPlayer}'s turn. Your color is ${playerColor}`);
  }
}, [playerColor]);

You can place the `useEffect` after the `gameCreated` and `gameJoined` event listeners, but make sure it's still inside the functional component. Here's the updated code:

```js
socket.on("assignColor", (color) => {
  setPlayerColor(color);
});

socket.on("gameCreated", ({ gameId, board }) => {
  setGameId(gameId);
  setBoard(board);
  setMessage(`Game created with ID: ${gameId}. Waiting for player 2...`);
});

socket.on("gameJoined", ({ gameId, board }) => {
  setGameId(gameId);
  setBoard(board);
  setMessage("Player 2 joined!");
});

socket.on('gameStart', (currentPlayer) => {
  setCurrentPlayer(currentPlayer);
});

useEffect(() => {
  if (playerColor) {
    setMessage(`Game started! ${currentPlayer}'s turn. Your color is ${playerColor}`);
  }
}, [playerColor]);

I apologize for the confusion. The useEffect should be placed outside of the nested callbacks but still inside the functional component. Here's the correct code:

```js
socket.on("assignColor", (color) => {
  setPlayerColor(color);
});

socket.on("gameCreated", ({ gameId, board }) => {
  setGameId(gameId);
  setBoard(board);
  setMessage(`Game created with ID: ${gameId}. Waiting for player 2...`);
});

socket.on("gameJoined", ({ gameId, board }) => {
  setGameId(gameId);
  setBoard(board);
  setMessage("Player 2 joined!");
});

socket.on('gameStart', (currentPlayer) => {
  setCurrentPlayer(currentPlayer);
});

useEffect(() => {
  if (playerColor && currentPlayer) {
    setMessage(`Game started! ${currentPlayer}'s turn. Your color is ${playerColor}`);
  }
}, [playerColor, currentPlayer]);
```

By adding `currentPlayer` as a dependency and checking for its existence, we ensure that the effect only runs when both `playerColor` and `currentPlayer` are set.