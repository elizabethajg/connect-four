import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import Board from "./Board";
import styles from "../styles/Game.module.css";

const createInitialBoard = () => {
  return Array.from({ length: 6 }, () => Array(7).fill(null));
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const Game = () => {
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(null);
  const [message, setMessage] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [gameMode, setGameMode] = useState(null);


  useEffect(() => {
    const newSocket = socketIOClient();
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("gameCreated", ({ gameId, board }) => {
        setGameId(gameId);
        setBoard(board);
        setMessage(`Game created with ID: ${gameId}. Waiting for player 2...`);
      });

      socket.on("startGame", ({ gameId, board, currentPlayer, playerColor }) => {
        setGameId(gameId);
        setBoard(board);
        setPlayerColor(playerColor);
        setCurrentPlayer(currentPlayer);
        console.log("PlayerColor: " + playerColor + "\n CurrentPlayer: " + currentPlayer);
      });

      socket.on("move", ({ board, currentPlayer }) => {
        setBoard(board);
        setCurrentPlayer(currentPlayer);
        setMessage(`${currentPlayer}'s turn`);
      });

      socket.on("gameOver", ({ winner }) => {
        setCurrentPlayer(null);
        setMessage(`${winner} won!`);
      });

      socket.on("gameNotFound", () => {
        setMessage("Game not found");
      });
    }
  }, [socket]);

  const createMultiplayerGame = () => {
    socket.emit("createGame");
  };

  const joinGame = (gameId) => {
    socket.emit("joinGame", gameId);
  };

  const createSinglePlayerGame = () => {
    setGameMode("singleplayer");
    setGameId("singleplayer");
    setBoard(createInitialBoard());
    setCurrentPlayer("red");
    setPlayerColor("red");
    setMessage("Make your first move.");
  };

  const makeMove = (col, player) => {
    for (let row = 5; row >= 0; row--) {
      if (!board[row][col]) {
        const newBoard = [...board];
        newBoard[row][col] = player;
        setBoard(newBoard);
        if (checkWin(row, col)) {
          setCurrentPlayer(null);
          setMessage(`${player} won!`);
        } else {
          setCurrentPlayer(player === "red" ? "yellow" : "red");
        }
        return true;
      }
    }
    return false;
  };

  const handleColumnClick = (col) => {
    if (gameId && board && playerColor === currentPlayer) {
      if (gameId === "singleplayer") {
        if (makeMove(col, "red")) {
          setMessage("AI is thinking...");
          setTimeout(() => {
            let aiMove = getRandomInt(7);
            while (!makeMove(aiMove, "yellow")) {
              aiMove = getRandomInt(7);
            }
            setMessage("Your turn");
          }, 2000);
        }
      } else {
        socket.emit("move", { gameId, col });
      }
    }
  };

  const renderInfo = () => {
    if (playerColor) {
      return (
        <div className={styles.playerInfo}>
          <p>You are {playerColor}</p>
          <span style={{ backgroundColor: playerColor === "red" ? "#ff4b4b" : "#ffd64b" }}></span>
        </div>
      );
    }
  };

  const renderGameModeButtons = () => {
    if (!board) {
      return (
        <div className={styles.gameMode}>
          <button
            className={styles.singleplayer} 
            onClick={() => createSinglePlayerGame()}>
            Singleplayer
          </button>
          <button
            className={styles.multiplayer} 
            onClick={() => setGameMode("multiplayer")}>
            Multiplayer
          </button>
        </div>
      );
    }
  };

  const renderButtons = () => {
    return (
      <div className={styles.drop}>
        {Array.from({ length: 7 }, (_, i) => (
          <button key={`btn-${i}`} onClick={() => handleColumnClick(i)}>
            ^
          </button>
        ))}
      </div>
    );
  };

  const renderJoinGame = () => {
    if (!board && gameMode === 'multiplayer'){
      return <><input
        type="text"
        placeholder="Enter game ID"
        onChange={(e) => (setGameId(e.target.value))} /><button onClick={() => joinGame(gameId)}>Join Game</button></>
    };
  }

  const renderCreateGame = () => {
    if(!board){
      return <button className={styles.create} onClick={createMultiplayerGame}>Create Game</button>;

    }
  }

  const checkWin = (row, col) => {
    const directions = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
    ];
  
    return directions.some((direction) => checkDirection(row, col, direction));
  };

  const checkDirection = (row, col, direction) => {
    const { x, y } = direction;
    let count = 1;

    for (let i = 1; i < 4; i++) {
      const r = row + i * y;
      const c = col + i * x;
      if (
        r >= 0 &&
        r < 6 &&
        c >= 0 &&
        c < 7 &&
        board[r][c] === currentPlayer
      ) {
        count++;
      } else {
        break;
      }
    }

    for (let i = 1; i < 4; i++) {
      const r = row - i * y;
      const c = col - i * x;
      if (
        r >= 0 &&
        r < 6 &&
        c >= 0 &&
        c < 7 &&
        board[r][c] === currentPlayer
      ) {
        count++;
      } else {
        break;
      }
    }

    return count >= 4;
  };

  return (
    <div>
      <div className={styles.row}>
        {renderInfo()}
        {message && <p className={styles.message}>{message}</p>}
      </div>
      <div className={styles.col}>
        {renderGameModeButtons()}
        {gameMode === 'multiplayer' && renderCreateGame()}
        <br></br>
        {gameMode === 'multiplayer' && renderJoinGame()}
        {board && <Board board={board} />}
        {board && renderButtons()}
      </div>
    </div>
  );
  }

export default Game;
