import React, { Component } from 'react';
import './index.sass';
import { CSSTransitionGroup } from 'react-transition-group';

export default class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: true
    };
  }
  close() {
    this.setState({
      opened: false
    })
  }
  render() {
    let modalItems = [];
    
    if (this.state.opened) {
      modalItems = [
        (<div className="modal-body" key="modal-body">
          {this.props.children}
        </div>),
        (<div className="overlay" key="overlay"></div>)];
    }
    
    return (<div className={"modal" + (this.props.className?' ' + this.props.className:'')}>
      <CSSTransitionGroup
        transitionName="modal"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={200}>
        {modalItems}
      </CSSTransitionGroup>
    </div>);
  }
}