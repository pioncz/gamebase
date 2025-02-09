import { styled } from '@/lib/stitches.config';
import { useState } from 'react';

const FullscreenButton = ({
  onToggle,
}: {
  onToggle?: () => void;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } else {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    }

    setIsFullscreen((f) => !f);

    if (onToggle) {
      onToggle();
    }
  };

  return (
    <Root
      className="nav-icon nav-icon--fullscreen"
      onClick={toggleFullscreen}
    >
      {isFullscreen ? (
        <span className="material-icons">close_fullscreen</span>
      ) : (
        <span className="material-icons-outlined">fullscreen</span>
      )}
    </Root>
  );
};

const Root = styled('div', {
  span: {
    display: 'block',
  }
});

export default FullscreenButton;
