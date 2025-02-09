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
  const seconds = Pad(secondsValue, '0', 2);
  const minutes = Pad(minutesValue, '0', 2);

  const tick = useCallback(() => {
    let diff = Math.floor((timestamp - Date.now()) / 1000);
    console.log('tick', timestamp, diff);
    if (diff < 0) {
      diff = 0;
      setTimestamp(0);
    }

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    setMinutesValue(minutes);
    setSecondsValue(seconds);
  }, [timestamp]);

  useEffect(() => {
    let newInterval: number;
    
    if (timestamp > 0) {
      newInterval = window.setInterval(tick, 50); 
    }

    return () => {
      if (newInterval) {
        clearInterval(newInterval);
      }
    }
  }, [timestamp, tick]);

  useImperativeHandle(
    ref,
    () => ({
      start: (lengthMs: number) => {
        setTimestamp(Date.now() + lengthMs);
      },
      stop: () => {
        setTimestamp(0);
      },
    }),
    [],
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
