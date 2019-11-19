import React, { Component, } from 'react'
import './index.sass'
import Modal from 'components/modal/index'
import Button from 'components/button/index'
import { Form, Field, } from 'react-final-form'
import { useTranslation, } from 'react-i18next';

const RegistrationModal = ({
  onClose, onSubmit,
}) => {
  const { t, } = useTranslation();
  const validate = values => {
    const errors = {};
    if (!values.email) {
      errors.email = "Required";
    }
    if (!values.login) {
      errors.login = "Required";
    }
    if (!values.password) {
      errors.password = "Required";
    }
    return errors;
  };


  return (
    <Modal className="modal--registration" open={true} onClose={onClose}>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ submitError, handleSubmit, submitting, pristine, invalid, }) => (
          <form onSubmit={handleSubmit}>
            <h3>{t('registrationModal.header')}</h3>
            <div>
              <label>{t('commons.email')}</label>
              <Field name="email" component="input" placeholder={t('commons.email')} />
            </div>
            <div>
              <label>{t('commons.login')}</label>
              <Field name="login" component="input" placeholder={t('commons.login')} />
            </div>
            <div>
              <label>{t('commons.password')}</label>
              <Field name="password" component="input" type="password" placeholder={t('commons.password')} />
            </div>
            <Button type="submit" disabled={pristine || invalid}>{t('commons.submit')}</Button>
          </form>
        )}
      />
    </Modal>
  );
};

export default RegistrationModal;