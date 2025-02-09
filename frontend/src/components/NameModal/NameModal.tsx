import Modal from '@/components/Modal/Modal';
import { useSelector } from 'react-redux';
import { getDices, getPlayer } from '@/store/GameSlice';
import { useState } from 'react';
import Button from '../Button/Button';

const FullscreenModal = ({
  onSubmit,
}: {
  onSubmit: ({
    login,
    diceId,
  }: {
    login: string;
    diceId: string;
  }) => void;
}) => {
  const player = useSelector(getPlayer);
  const dices = useSelector(getDices);
  const [login, setLogin] = useState(player.login || '');
  const [diceId, setDiceId] = useState(player.diceId || '');
  const [disabled, setDisabled] = useState(false);

  return (
    <Modal className="modal--name">
      <h3>Choose login</h3>
      <input
        placeholder="login"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      ></input>
      <h3>Pick dice</h3>
      <div className="dices-container">
        {dices.map((dice) => (
          <div
            key={dice.id}
            style={{ background: dice.colors[0] }}
            className={`dice${diceId === dice.id ? ' selected' : ''}`}
            onClick={() => {
              setDiceId(dice.id);
            }}
          >
            <div
              className="dice__spot"
              style={{ background: dice.colors[1] }}
            />
            <div
              className="dice__spot"
              style={{ background: dice.colors[1] }}
            />
            <div
              className="dice__spot"
              style={{ background: dice.colors[1] }}
            />
            <div
              className="dice__spot"
              style={{ background: dice.colors[1] }}
            />
            <div
              className="dice__spot"
              style={{ background: dice.colors[1] }}
            />
            <div
              className="dice__spot"
              style={{ background: dice.colors[1] }}
            />
          </div>
        ))}
      </div>
      <Button
        onClick={() => {
          setDisabled(true);
          onSubmit({ login, diceId });
        }}
        disabled={disabled}
      >
        Submit
      </Button>
    </Modal>
  );
};

export default FullscreenModal;
