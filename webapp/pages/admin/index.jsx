import React, { Component, Fragment, useEffect, useState, } from 'react'
import ReactJson from 'react-json-view'
import './index.sass'
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

const ConfigTab = ({connectorInstance,}) => {
  const [timeoutInput, setTimeoutInput,] = useState('_');
  const [minPlayersInput, setMinPlayersInput,] = useState('_');

  connectorInstance.socket.on('config', (config) =>{
    setTimeoutInput(config.RoomQueueTimeout);
    setMinPlayersInput(config.MinPlayers);
  });

  useEffect(() => {
    connectorInstance.socket.emit('getConfig');
  }, [connectorInstance,]);

  useEffect(() => {
    connectorInstance.socket.emit('setConfig', {
      RoomQueueTimeout: timeoutInput,
      MinPlayers: minPlayersInput,
    });
  }, [timeoutInput,minPlayersInput,]);

  return (
    <Fragment>
      <div>Room queue timeout:</div>
      {timeoutInput !== '_' && (<Fragment>
        <input type="number" value={timeoutInput} onChange={e => setTimeoutInput(e.target.value)} />s
      </Fragment>)}
      <div>Max players</div>
      {minPlayersInput !== '_' && (<Fragment>
        <input type="number" value={minPlayersInput} onChange={e => setMinPlayersInput(e.target.value)} />
      </Fragment>)}
    </Fragment>
  );
};

class Admin  extends Component {
  state = {
    activetab: 0,
    serverStats: {},
  };
  handleChange = (event, activetab) => {
    this.setState({ activetab, });
  };

  constructor(props) {
    super(props);

    this.getStatsInterval = null;
    this.connectorInstance = this.props.connectorInstance;
    this.getStats = this.getStats.bind(this);
    this.handleGetStats = this.handleGetStats.bind(this);
  }
  componentDidMount() {
    this.connectorInstance.socket.on('statsUpdate', this.handleGetStats);
    this.getStats();
    this.getStatsInterval = setInterval(this.getStats, 500);
  }
  componentWillUnmount() {
    // this.connectorInstance.socket.off('statsUpdate', this.handleGetStats);
    clearInterval(this.getStatsInterval);
  }
  getStats() {
    this.connectorInstance.socket.emit('getStats');
  }
  handleGetStats(stats) {
    const newStats = { ...stats,};
    delete newStats.logs;
    this.setState({
      serverStats: newStats,
    });
  }
  render() {
    const { activetab, } = this.state;

    return (
      <div className = "admin-page">
        <AppBar position="static">
          <Tabs value={activetab} onChange={this.handleChange}>
            <Tab label="Server data" />
            <Tab label="Item Two" />
            <Tab label="Config" />
          </Tabs>
        </AppBar>
        {activetab === 0 && <div className = "tab-container">
          <div className="admin-page">
            <ReactJson src={this.state.serverStats} theme="monokai" collapsed={2} />
          </div>
        </div>}
        {activetab === 1 && <div className = "tab-container">Item Two</div>}
        {activetab === 2 && (
          <div className = "tab-container">
            <ConfigTab connectorInstance={this.props.connectorInstance}/>
          </div>
        )}
      </div>
    );
  }
}

Admin.propTypes = {
};

export default Admin;