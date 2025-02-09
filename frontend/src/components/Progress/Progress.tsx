import { styled } from '@/lib/stitches.config';
import { useEffect, useState } from 'react';

const Progres = ({
  value,
  rotated,
  length,
}: {
  value?: number;
  rotated?: boolean;
  length?: number;
}) => {
  const [intervalValue, setIntervalValue] = useState(0);
  const [lastTick, setLastTick] = useState(0);

  useEffect(() => {
    let updateInterval: number | null = null;

    const clear = () => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    };

    if (length) {
      updateInterval = setInterval(() => {
        const now = Date.now();
        let newValue = lastTick
          ? intervalValue + (now - lastTick) / length
          : 0;
        newValue = Math.min(newValue, 1);
        setIntervalValue(newValue);
        setLastTick(now);
        if (newValue >= 1) {
          clear();
        }
      }, 60);
    }

    return () => {
      clear();
    };
  }, [intervalValue, lastTick, length]);

  const progressValue = intervalValue ? 1 - intervalValue : value;
  const style = progressValue
    ? { width: `${progressValue * 100}%` }
    : {};

  return (
    <Root
      className={`progress ${rotated ? 'progress--rotated' : ''}`}
      style={style}
    ></Root>
  );
};

const Root = styled('div', {
  display: 'block',
  width: '0%',
  height: '100%',
  backgroundImage: 'linear-gradient(45deg, #ffffff30, #ffffffcc)',
  position: 'absolute',
  bottom: '0px',
  left: '0px',
});

export default Progres;
