import React, { Component } from 'react';
import Modal from 'components/modal/index.jsx';
import Button from 'components/button/index.jsx';
import './initialPage.sass';

export default class InitialPage extends Component {
  constructor(props) {
    super(props);
    
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    if (this.modal) {
      this.modal.close();
    }
  }
  render() {
    return (<Modal className="initialPage" ref={(element) => {this.modal = element;}}>
      <h3>Zacznij</h3>
      <div className="buttons-container">
        <Button onClick={this.handleClick}>START</Button>
      </div>
    </Modal>);
  }
}