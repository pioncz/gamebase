import React, { Component } from 'react'
import Modal from 'components/modal/index'
import './index.sass'
import FullscreenButton from 'components/fullscreenButton'


export default class FullscreenModal extends Component {
    constructor(props) {
        super(props);
    }

    toggleHandler = () => {
        const { onToggle } = this.props;

        if(onToggle){
            onToggle();
        }
    }


    render() {
        const { onClose, onSubmit } = this.props;
            

        return <Modal className="modal--fullscreen" open={true} onClose={onClose}>
            <h3>Consider playing in fullscreen by clicking fullscreen button below or in the right botom corner of your screen.</h3>
            <FullscreenButton onToggle={ this.toggleHandler } /> 
            
        </Modal>;
        
    }
}