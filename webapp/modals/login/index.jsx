import React, { Component } from 'react'
import './index.sass'
import Modal from 'components/modal/index'
import Button from 'components/button/index'
import { Form, Field } from 'react-final-form'

export default class LoginModal extends Component {
  constructor(props) {
    super(props);
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
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ submitError, handleSubmit, submitting, pristine, invalid }) => (
          <form onSubmit={handleSubmit}>
            <h3>Login</h3>
            <div>
              <label>Email</label>
              <Field name="email" component="input" placeholder="Email" />
            </div>
            <div>
              <label>Password</label>
              <Field name="password" component="input" type="password" placeholder="Password" />
            </div>
            <Button type="submit" disabled={pristine || invalid}>Submit</Button>
          </form>
        )}
      />
    </Modal>;
  }
}