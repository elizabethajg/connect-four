import React from 'react';
import Game from 'src/client/components/Game.js';

//Returns a page header and Game component 
const HomePage = () => {
  return (
    <div>
      <h1>Connect Four</h1>
      <Game />
    </div>
  );
};

export default HomePage;