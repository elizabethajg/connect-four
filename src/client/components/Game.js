import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import Board from "./Board";
import styles from "../styles/Game.module.css";

const Game = () => {
  const [socket, setSocket] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(null);
  const [message, setMessage] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);


  useEffect(() => {
    const newSocket = socketIOClient();
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("gameCreated", ({gameId, board}) => {
        setGameId(gameId);
        setBoard(board);
        setMessage(`Game created with ID: ${gameId}. Waiting for player 2...`);
      });

      socket.on("startGame", ({ gameId, board, currentPlayer, playerColor}) => {
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

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = (gameId) => {
    socket.emit("joinGame", gameId);
  };


  const handleColumnClick = (col) => {
    if (gameId && board && playerColor === currentPlayer) {
      socket.emit("move", { gameId, col });
    }
  };

  const renderInfo = () => {
    if(playerColor){
      return (
        <div className={styles.playerInfo}>
          <p>You are {playerColor}</p>
          <span style={{backgroundColor: playerColor === 'red' ? '#ff4b4b' : '#ffd64b'}}></span>
        </div>
      );
    }
  }
  const renderButtons = () => {
    return (
      <div className = {styles.drop}>
        {Array.from({ length: 7 }, (_, i) => (
          <button key={`btn-${i}`} onClick={() => handleColumnClick(i)}>
            ^
          </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      <button onClick={createGame}>Create Game</button>
      <br></br>
      <input
        type="text"
        placeholder="Enter game ID"
        onChange={(e) => (setGameId(e.target.value))}
      />
      <button onClick={() => joinGame(gameId)}>Join Game</button>
      {message && <p>{message}</p>}
      {board && <Board board={board} />}
      {board && renderButtons()}
      {renderInfo()}

    </div>
  );
};

export default Game;


