import React, { Component, } from 'react';
import './index.sass';

const Pad = (str, padString, length) => {
  let returnStr = ''+str;

  while (returnStr.length < length)
    returnStr = padString + returnStr;

  return returnStr;
};

export default class Timer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsValue: 0,
      minutesValue: 0,
      timestamp: 0,
      interval: null,
    };

    this.tick = this.tick.bind(this);
    this.stop = this.stop.bind(this);
  }
  componentWillUnmount() {
    const { interval, } = this.state;

    if (interval) {
      window.clearInterval(interval);
    }
  }
  start(lengthMs) {
    this.setState({
      timestamp: Date.now() + lengthMs,
      interval: window.setInterval(this.tick, 50),
    }, this.tick);
  }
  tick() {
    const { timestamp, } = this.state;
    let diff = Math.floor((timestamp - Date.now())/1000),//in seconds
      minutes,
      seconds;

    if (diff < 0) {
      diff = 0;
      this.stop();
    }

    minutes = Math.floor(diff/60);
    seconds = diff % 60;

    this.setState({
      secondsValue: seconds,
      minutesValue: minutes,
    });
  }
  stop() {
    window.clearInterval(this.state.interval);
    this.setState({
      interval: null,
      timestamp: 0,
      secondsValue: 0,
      minutesValue: 0,
    });
  }
  render() {
    const { secondsValue, minutesValue, } = this.state,
      seconds = Pad(secondsValue, '0', 2),
      minutes = Pad(minutesValue, '0', 2);

    return <div className="timer">{minutes}:{seconds}</div>;
  }
}