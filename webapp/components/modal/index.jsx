import React, { Component } from 'react';
import './index.sass'

export default class Modal extends Component {
  constructor(props) {
    super(props);
    
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
  
  }
  render() {
    return (<div className={"modal" + (this.props.className?' ' + this.props.className:'')}>
      <div className="modal-body">
        {this.props.children}
      </div>
      <div className="overlay"></div>
    </div>);
  }
}