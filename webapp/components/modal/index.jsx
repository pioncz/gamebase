import React, { Component } from 'react';
import './index.sass';
import { CSSTransitionGroup } from 'react-transition-group';
import Close from 'components/close/';

export default class Modal extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let modalItems = [];
    
    if (this.props.open) {
      modalItems = [
        (<div className="modal-body" key="modal-body">
          {this.props.children}
          {this.props.onClose && <Close onClick={this.props.onClose}/>}
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