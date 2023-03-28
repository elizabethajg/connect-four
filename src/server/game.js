const ObjectId = require('mongodb').ObjectId;

class GameLogic {
  constructor(gameId, db) {
    this.gameId = gameId;
    this.board = Array.from({ length: 6 }, () => Array(7).fill(null));
    this.gameOver = false;
    this.winner = null;
    this.db = db;
    this.currentPlayer = 'Red';
  }

  async save() {
    await this.db.collection('games').updateOne(
      { _id: new ObjectId(this.gameId) },
      { $set: { board: this.board, currentPlayer: this.currentPlayer, gameOver: this.gameOver, winner: this.winner } },
      { upsert: true }
    );
  }

  async placePiece(col) {
    if (!this.isValidMove(col) || this.gameOver) return false;

    let row;
    for (let r = 5; r >= 0; r--) {
      if (this.board[r][col] === null) {
        this.board[r][col] = this.currentPlayer;
        row = r;
        break;
      }
    }

    if (this.checkWin(row, col)) {
      this.gameOver = true;
      this.winner = this.currentPlayer;
    } else {
      this.currentPlayer = this.currentPlayer === 'Red' ? 'Yellow' : 'Red';
    }

    await this.save();
    return true;
  }
  
    isValidMove(col) {
      return this.board[0][col] === null;
    }

    checkWin(row, col) {
      const directions = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: -1 },
      ];
    
      return directions.some((direction) => this.checkDirection(row, col, direction));
    }

  
    checkDirection(row, col, direction) {
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
          this.board[r][c] === this.currentPlayer
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
          this.board[r][c] === this.currentPlayer
        ) {
          count++;
        } else {
          break;
        }
      }
  
      return count >= 4;
    }
  }

  module.exports = GameLogic;