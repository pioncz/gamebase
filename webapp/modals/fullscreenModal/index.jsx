import React from 'react';
import Modal from 'components/modal/index';
import './index.sass';
import FullscreenButton from 'components/fullscreenButton';
import { useTranslation, } from 'react-i18next';

const FullscreenModal = ({
  onClose,
  onToggle,
}) => {
  const { t, } = useTranslation();

  return (
    <Modal className="modal--fullscreen" open={true} onClose={onClose}>
      <h3>{t('fullscreenModal.info')}</h3>
      <FullscreenButton onToggle={ () => onToggle && onToggle() } />

    </Modal>
  );
}

export default FullscreenModal;