import React from 'react'
import Modal from 'components/modal/index'
import './index.sass'
import FullscreenButton from 'components/fullscreenButton'
import { pure, } from 'recompose';


function FullscreenModal ({ onClose, onToggle, }) {

  return (
    <Modal className="modal--fullscreen" open={true} onClose={onClose}>

      <h3>Consider playing in fullscreen by clicking fullscreen button below or in the right botom corner of your screen.</h3>
      <FullscreenButton onToggle={ () => onToggle && onToggle() } />

    </Modal>
  );
}

export default pure(FullscreenModal);