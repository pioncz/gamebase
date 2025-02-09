import { styled } from '@/lib/stitches.config';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

const Pad = (num: number, padString: string, length: number) => {
  let returnStr = '' + num;

  while (returnStr.length < length) returnStr = padString + returnStr;

  return returnStr;
};

export type TimerHandle = {
  start: (lengthMs: number) => void;
  stop: () => void;
};

const Timer = forwardRef((_props, ref) => {
  const [secondsValue, setSecondsValue] = useState(0);
  const [minutesValue, setMinutesValue] = useState(0);
  const [timestamp, setTimestamp] = useState(0);
  const [interval, setInterval] = useState<number | null>(null);
  const seconds = Pad(secondsValue, '0', 2);
  const minutes = Pad(minutesValue, '0', 2);

  const stop = useCallback(() => {
    if (interval) {
      clearInterval(interval);
    }
    setInterval(null);
    setTimestamp(0);
    setSecondsValue(0);
    setMinutesValue(0);
  }, [interval]);

  const tick = useCallback(() => {
    let diff = Math.floor((timestamp - Date.now()) / 1000);

    if (diff < 0) {
      diff = 0;
      stop();
    }

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    setMinutesValue(minutes);
    setSecondsValue(seconds);
  }, [timestamp, stop]);

  useEffect(
    () => () => {
      if (interval) {
        clearInterval(interval);
      }
    },
    [interval],
  );

  useImperativeHandle(
    ref,
    () => ({
      start: (lengthMs: number) => {
        setTimestamp(Date.now() + lengthMs);

        setInterval(window.setInterval(tick, 50));
      },
      stop: () => {
        stop();
      },
    }),
    [tick, stop],
  );

  return (
    <Root className="timer">
      {minutes}:{seconds}
    </Root>
  );
});

const Root = styled('div', {
  position: 'absolute',
  zIndex: 100,
  top: '6px',
  left: '50%',
  background: 'rgba(0,0,0,0.3)',
  color: '#fff',
  padding: '10px 17px',
  transform: 'translateX(-50%)',
  userSelect: 'none',
});

export default Timer;
