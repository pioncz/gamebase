import React, { Component, } from 'react'
import ReactJson from 'react-json-view'
import './index.sass'
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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
      <div className = "admin-tabs">
        <AppBar position="static">
          <Tabs value={activetab} onChange={this.handleChange}>
            <Tab label="Server data" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </AppBar>
        {activetab === 0 && <div className = "tab-container">

          <div className="admin-page">
            <ReactJson src={this.state.serverStats} theme="monokai" collapsed={2} />
          </div>

        </div>}
        {activetab === 1 && <div className = "tab-container">Item Two</div>}
        {activetab === 2 && <div className = "tab-container">Item Three</div>}
      </div>
    );
  }
}

Admin.propTypes = {
};

export default Admin;