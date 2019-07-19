import React from 'react';
import './index.sass';
import ClassNames from 'classnames';
import DicesImage from 'dices.svg';

const Dices = ({visible, active, color, onClick, }) => {
  const diceContainerClass = ClassNames({
    'dices': true,
    'dices--visible': visible,
    'dices--active': active,
  });

  const diceContainerStyle = color && {
    boxShadow: `inset 0 0 10px ${color}`,
  };

  return (
    <div
      className={diceContainerClass}
      style={diceContainerStyle}
      onClick={onClick}
    >
      <DicesImage />
    </div>
  );
};

export default Dices;