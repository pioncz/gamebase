import React, { Component } from 'react';
import './index.sass'

export default class Button extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (<div className="button" onClick={this.props.onClick}>
      {this.props.children}
    </div>);
  }
}