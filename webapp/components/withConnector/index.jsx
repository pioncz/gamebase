import React, { Component } from 'react'

export default function withConnector(WrappedComponent) {
  return class extends Component {
    constructor(props) {
      super(props);
    }
    render() {
      return <WrappedComponent/>
    }
  }
}