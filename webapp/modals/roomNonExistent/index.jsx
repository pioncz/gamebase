import React, { Component, } from 'react'
import Modal from 'components/modal/index'
import { withRouter, } from 'react-router-dom';

class RoomNonExistentModal extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { history, } = this.props;

    this.redirectTimeout = setTimeout(() => {
      history.push('/');
      this.redirectTimeout = null;
    }, 5000);
  }
  componentWillUnmount() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }
  render() {
    return <Modal className="modal--registration" open={true}>
      <h3>Taka gra nie istnieje</h3>
      <p>Zaraz zostaniesz przekierowany na stronę główną</p>
    </Modal>;
  }
}

export default withRouter(RoomNonExistentModal);