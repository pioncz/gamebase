import React, { useState } from 'react';
import Modal from 'components/modal/index';
import './index.sass';
import { useTranslation, } from 'react-i18next';
import Button from 'components/button/';

const NameModal = ({
  onSubmit, dices, player,
}) => {
  const { t, } = useTranslation();
  const [login, setLogin] = useState(player.login);
  const [diceId, setDiceId] = useState(player.diceId);
  const [disabled, setDisabled] = useState(false);

  return (
    <Modal className="modal--name" open={true}>
      <h3>{t('nameModal.pickName')}</h3>
      <input
        placeholder="login"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
      ></input>
      <h3>{t('nameModal.pickDice')}</h3>
      <div className="dices-container">
        {dices.map(dice => (
          <div
            key={dice.id}
            style={{background: dice.colors[0],}}
            className={`dice${diceId === dice.id ? ' selected' : ''}`}
            onClick={() => { setDiceId(dice.id)}}
          >
            <div className="dice__spot" style={{background: dice.colors[1],}} />
            <div className="dice__spot" style={{background: dice.colors[1],}} />
            <div className="dice__spot" style={{background: dice.colors[1],}} />
            <div className="dice__spot" style={{background: dice.colors[1],}} />
            <div className="dice__spot" style={{background: dice.colors[1],}} />
            <div className="dice__spot" style={{background: dice.colors[1],}} />
          </div>
        ))}
      </div>
      <Button 
        onClick={() => {setDisabled(true); onSubmit({login, diceId})}}
        disabled={disabled}
      >{t('commons.submit')}</Button>
    </Modal>
  );
}

export default NameModal;