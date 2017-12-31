import React, { Component } from 'react';
import './index.sass';
import { CSSTransitionGroup } from 'react-transition-group';

export default class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      opened: false
    };
  }
  close() {
    this.setState({
      opened: false
    })
  }
  open() {
    this.setState({
      opened: true
    })
  }
  componentWillReceiveProps(nextProps) {
    this.open();
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