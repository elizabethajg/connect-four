const Home = () => {
    const [gameId, setGameId] = React.useState('');
    const [board, setBoard] = React.useState(null);
    const [message, setMessage] = React.useState('');
    const [socket, setSocket] = React.useState(null);
  
    React.useEffect(() => {
      const newSocket = io();
      setSocket(newSocket);
      newSocket.on('gameCreated', (data) => {
        setGameId(data.gameId);
        setBoard(data.board);
      });
      newSocket.on('gameJoined', (data) => {
        setGameId(data.gameId);
        setBoard(data.board);
      });
      newSocket.on('gameStart', (currentPlayer) => {
        setMessage(`Player ${currentPlayer} starts`);
      });
      newSocket.on('move', (data) => {
        setBoard(data.board);
        setMessage(`Player ${data.currentPlayer}'s turn`);
      });
      newSocket.on('gameOver', (data) => {
        setMessage(`Player ${data.winner} wins!`);
      });
      newSocket.on('gameNotFound', () => {
        setMessage('Game not found');
      });
      return () => newSocket.close();
    }, []);
  
    const createGame = () => socket.emit('createGame');
    const joinGame = () => socket.emit('joinGame', gameId);
    const onMove = (col) => socket.emit('move', { gameId, col });
  
    return (
      <div>
        <h1>Game: {gameId}</h1>
        {board && <BoardComponent board={board} onMove={onMove} />}
        {!board && (
          <>
            <button onClick={createGame}>Create Game</button>
            <input value={gameId} onChange={(e) => setGameId(e.target.value)} />
            <button onClick={joinGame}>Join Game</button>
          </>
        )}
        <p>{message}</p>
      </div>
    );
  };

  