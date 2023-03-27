import React from 'react';
import Piece from './Piece';
import styles from '../styles/Board.module.css';

class Board extends React.Component {
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

  render() {
    return <div className={styles.board}>{this.createBoard()}</div>;
  }
}

export default Board;
