import React, { Component } from 'react';

export default class Engine extends Component {
  constructor(props) {
    super(props);
  
    this.connectorInstance = null;
  }
  componentDidMount() {
    if (this.props.connectorInstance) {
      this.connectorInstance = this.props.connectorInstance;
      this.connectorInstance.showConsole();
    }
  }
  componentWillUnmount() {
    if (this.connectorInstance) {
      this.connectorInstance.hideConsole();
    }
  }
  render() {
    return <div>Elo</div>;
  }
}