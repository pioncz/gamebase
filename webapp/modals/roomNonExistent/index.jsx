import React, { Component, } from 'react'
import Modal from 'components/modal/index'
import Button from 'components/button/index'
import { withRouter, } from 'react-router-dom'

class RoomNonExistentModal extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.redirectTimeout = setTimeout(this.redirect, 5000);
  }
  componentWillUnmount() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }
  redirect = () => {
    const { history, } = this.props;

    history.push('/');
  }
  render() {
    return <Modal className="modal--registration" open={true}>
      <h3>Taka gra nie istnieje</h3>
      <p>Zaraz zostaniesz przekierowany na stronę główną</p>
      <Button onClick={this.redirect}>NOWA GRA</Button>
    </Modal>;
  }
}

export default withRouter(RoomNonExistentModal);