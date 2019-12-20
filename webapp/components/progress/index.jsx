import React, { Component, useEffect, useState, } from 'react';
import './index.sass';

const Progress = ({
  value, rotated, length,
}) => {
  const [intervalValue, setIntervalValue,] = useState();
  const [lastTick, setLastTick,] = useState();

  useEffect(() => {
    if (length) {
      let updateInterval = setInterval(() => {
        let now = Date.now();
        let newValue = lastTick ? (intervalValue + (now - lastTick) / length) : 0;
        newValue = Math.min(newValue, 1);
        setIntervalValue(newValue);
        setLastTick(now);
        if (newValue === 1) {
          clear();
        }
      }, 60);
      const clear = () => {
        if (updateInterval) {
          clearInterval(updateInterval);
          updateInterval = null;
        }
      };

      return clear;
    }
  }, [intervalValue, lastTick, length,]);

  let progressValue = intervalValue ? (1 - intervalValue) : value;
  const style = progressValue ? {width: `${progressValue * 100}%`,} : {};

  return (
    <div className={`progress ${rotated?'progress--rotated':''}`} style={style}></div>
  );
}

export default Progress;