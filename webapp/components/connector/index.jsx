import React, { Component, } from 'react'
import './index.sass'
import ioClient from 'socket.io-client'
import Config from 'config';

export default class Connector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: true,
    };

    this.socket = ioClient(Config.ws.host);

    this.socket.on('connect', () => {
      this.setState({
        connected: true,
      });
    });
    this.socket.on('connect_error', (e) => {
      this.setState({
        connected: false,
      });
    });
    this.socket.on('disconnect', () => {
      this.setState({
        connected: false,
      });
    });
    this.socket.on('socketError', (e) => {
      console.error('socketError', e);
    });
  }
  leaveGame() {
    this.socket.emit('leaveGame');
  }
  joinQueue({game,}) {
    this.socket.emit('joinQueue', {game,});
  }
  render() {
    const {connected,} = this.state;

    return (<div className={"connector"}>
      {!connected && <div className={"offline"}>OFFLINE</div>}
    </div>);
  }
}