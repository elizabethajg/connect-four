import React from 'react';
import styles from '../styles/Piece.module.css';

const Piece = ({ color }) => {
    return <div className={`${styles.piece} ${styles[color] || ''}`}></div>;
};

export default Piece;