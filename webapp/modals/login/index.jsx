import React, { Component, } from 'react'
import './index.sass'
import Modal from 'components/modal/index'
import Button from 'components/button/index'
import { Form, Field, } from 'react-final-form'
import { useTranslation, } from 'react-i18next';

const LoginModal = ({
  onClose, onSubmit,
}) => {
  const { t, } = useTranslation();
  const validate = values => {
    const errors = {};
    if (!values.email) {
      errors.email = t('commons.required');
    }
    if (!values.password) {
      errors.password = t('commons.required');
    }
    return errors;
  };


  return (
    <Modal className="modal--login" open={true} onClose={onClose}>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ submitError, handleSubmit, submitting, pristine, invalid, }) => (
          <form onSubmit={handleSubmit}>
            <h3>{t('loginModal.header')}</h3>
            <div>
              <label>{t('commons.email')}</label>
              <Field name="email" component="input" placeholder={t('commons.email')} />
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

export default LoginModal;