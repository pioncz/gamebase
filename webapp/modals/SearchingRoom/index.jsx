import React, { Component, } from 'react'
import Modal from 'components/modal'

export default class SearchingRoom extends Component {
  render() {
    return (
      <Modal open={true}>
        <h3>Szukanie graczy</h3>
        <p>Przewidywany czas 2min</p>
      </Modal>
    );
  }
}
