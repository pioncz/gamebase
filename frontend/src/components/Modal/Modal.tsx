import { styled } from '@stitches/react';

const Modal = ({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) => {
  return (
    <Root className={`modal ${className ? ` ${className}` : ''}`}>
      <div className="modal-body" key="modal-body">
        {children}
        {onClose && <button className={'close'} onClick={onClose} />}
      </div>
      <div className="overlay" key="overlay"></div>
    </Root>
  );
};

const Root = styled('div', {
  position: 'absolute',
  zIndex: 1000,
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  textAlign: 'center',

  '.modal-body': {
    position: 'absolute',
    width: '340px',
    maxWidth: 'calc(100% - 12px)',
    background: '$primary700',
    color: '#fff',
    borderBottom: '2px solid $primary',
    zIndex: 10,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '4px',
    padding: '20px 40px',

    '&.modal-enter': {
      top: 0,
    },

    '&.modal-enter.modal-enter-active': {
      top: '50%',
    },

    '&.modal-leave': {
      top: '50%',
    },

    '&.modal-leave.modal-leave-active': {
      top: 0,
    },
  },

  '.overlay': {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 0,
  },

  '.modal-enter': {
    opacity: 0.01,

    '&.modal-enter-active': {
      opacity: 1,
      transition: 'opacity 300ms ease-in, top 300ms ease-in',
    },
  },

  '.modal-leave': {
    opacity: 1,

    '.modal-body': {
      top: '50%',
    },

    '&.modal-leave-active': {
      opacity: 0.01,
      transition: 'opacity 200ms ease-in, top 300ms ease-in',
    },
  },

  '.close': {
    position: 'relative',
    display: 'block',
    width: '24px',
    height: '24px',
    opacity: 0.3,
    transition: 'all .2s ease-in-out',
    cursor: 'pointer',
    margin: '10px',
    background: '#fff',
    border: 0,

    '&:hover': {
      opacity: 1,
    },

    '&:before, &:after': {
      position: 'absolute',
      top: 0,
      left: '50%',
      content: ' ',
      height: '100%',
      width: '2px',
      backgroundColor: '#333',
      transform: 'translateX(-50%) rotate(45deg)',
    },

    '&:after': {
      transform: 'translateX(-50%) rotate(-45deg)',
    },
  },
});

export default Modal;
