import React, { Component } from 'react'
import Modal from 'components/modal/index'
import Button from 'components/button/index'
import { Form, Field } from 'react-final-form'

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
        const { onClose, onSubmit } = this.props,
            validate = values => {
                const errors = {};
                if (!values.email) {
                    errors.email = "Required";
                }
                if (!values.password) {
                    errors.password = "Required";
                }
                return errors;
            };

        return <Modal className="modal--login" open={true} onClose={onClose}>
            <FullscreenButton onToggle={ this.toggleHandler } />
        </Modal>;
    }
}