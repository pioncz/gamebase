import React, { Component } from 'react';
import './index.sass'

export default class Button extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { children, ...restProps } = this.props; 
    
    return (<button className="button" {...restProps}>
      {children}
    </button>);
  }
}