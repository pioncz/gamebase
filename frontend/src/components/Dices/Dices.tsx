import DicesImage from '@/assets/dices.svg?react';
import { styled } from '@/lib/stitches.config';

const Dices = ({
  visible,
  active,
  color,
  onClick,
}: {
  visible: boolean;
  active: boolean;
  color?: string;
  onClick: () => void;
}) => {
  const diceContainerClass = `dices ${
    visible ? 'dices--visible' : ''
  } ${active ? 'dices--active' : ''}`;

  const diceContainerStyle = color
    ? {
        boxShadow: `inset 0 0 10px ${color}`,
      }
    : undefined;

  return (
    <Root
      className={diceContainerClass}
      style={diceContainerStyle}
      onClick={onClick}
    >
      <div className="dices-label">
        <span>Roll dice</span>
        <DicesImage />
      </div>
    </Root>
  );
};

const Root = styled('div', {
  position: 'absolute',
  zIndex: 50,
  width: '200px',
  height: '75px',
  background: 'rgba(0, 0, 0, 0.2)',
  padding: '10px',
  left: '-200px',
  top: '98px',
  textAlign: 'center',
  pointerEvents: 'none',
  borderRadius: '$border-radius',

  '.dices-label': {
    display: 'inline',

    span: {
      display: 'none',
      userSelect: 'none',
    },

    svg: {
      height: '100%',
      width: 'auto',

      path: {
        fill: '#848484',
      },
    },
  },

  '&.dices--visible': {
    left: '6px',
  },

  '&.dices--active': {
    cursor: 'pointer',
    pointerEvents: 'all',
    border: '2px solid rgba(255,255,255,0.7)',
  },
});

export default Dices;
