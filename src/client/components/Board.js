import React from 'react';
import Piece from './Piece';
import styles from '../styles/Board.module.css';

class Board extends React.Component {

  // Method that creates the board by iterating through each row and column
  createBoard() {
    const rows = [];
    for (let r = 0; r < 6; r++) {
      const cols = [];
      for (let c = 0; c < 7; c++) {
        cols.push(<Piece key={`col-${c}`} color={(this.props.board && this.props.board[r]) ? this.props.board[r][c] : null} />);
    }
      rows.push(<div key={`row-${r}`} className={styles.boardRow}>{cols}</div>);
    }
    return rows;
  }

  // Render method that returns a div element with the Board module CSS styles and calls the createBoard method to render the board
  render() {
    return <div className={styles.board}>{this.createBoard()}</div>;
  }
}

export default Board;


