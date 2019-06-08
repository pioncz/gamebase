import React, { Component } from 'react'
import ReactJson from 'react-json-view'
import './index.sass'
import AdminTabs from 'components/adminTabs';

export default class Admin extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      serverStats: {},
    };
  
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
    this.setState({
      serverStats: stats,
    });
  }
  render() {
    return <div className="admin-page">
      <div>Server data</div>
      <ReactJson src={this.state.serverStats} theme="monokai" />
    </div>
  }
}