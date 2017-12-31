import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default function withConnector(WrappedComponent) {
  class withConnector extends Component {
    constructor(props) {
      super(props);
    }
    render() {
      let connectorInstance = this.context.connectorInstance;
      
      return <WrappedComponent
        {...this.props}
        connectorInstance={connectorInstance}
      />
    }
  }
  
  withConnector.contextTypes = {
    connectorInstance: PropTypes.object
  };
  
  return withConnector;
}