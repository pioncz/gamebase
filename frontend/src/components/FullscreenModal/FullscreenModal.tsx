import Modal from '@/components/Modal/Modal';
import FullscreenButton from '../FullscreenButton/FullscreenButton';

const FullscreenModal = ({
  onClose,
  onToggle,
}: {
  onClose: () => void;
  onToggle: () => void;
}) => {
  return (
    <Modal className="modal--fullscreen" onClose={onClose}>
      <h3>
        Consider playing in fullscreen by clicking fullscreen button
        below or in the right botom corner of your screen.
      </h3>
      <FullscreenButton onToggle={() => onToggle && onToggle()} />
    </Modal>
  );
};

export default FullscreenModal;
