import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { confirmable } from 'react-confirm';
import { Button, Modal, Form } from 'react-bootstrap';

import { Formik } from 'formik';
import * as Yup from 'yup';

const Dialog = ({ show, confirmButtonText = 'Yes', cancelButtonText = 'No', proceed, title, confirmation, options, inputs = [], customTopAlert = null }) => {
  if (inputs.length) {
    return (
      <Modal 
        show={show} 
        onHide={() => proceed(false)}
        className=""
      >
        <Modal.Header className="border-0" closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={inputs.reduce((o, c) => {
            o[c.name] = '';
            return o;
          }, {})}
          validationSchema={Yup.object().shape(inputs.reduce((o, c) => {
            o[c.name] = Yup.string().required('Required').nullable();
            return o;
          }, {}))}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true);
            setTimeout(() => {
              setSubmitting(false);
              proceed(values);
            }, 400);
          }}
          >
           {({
             values,
             errors,
             touched,
             handleChange,
             handleBlur,
             handleSubmit,
             isSubmitting,
           }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {customTopAlert}
                {inputs.map(input => (
                  <Form.Group className="mb-3">
                    <Form.Label>{input.label}</Form.Label>
                    <Form.Control
                      {...input}
                      placeholder={input.label}
                      value={values[input.name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors[input.name] && touched[input.name] && 'is-invalid'}
                    />
                    {errors[input.name] && touched[input.name] && <div className="invalid-feedback">{errors[input.name]}</div>}
                  </Form.Group>
                ))}
              </Modal.Body>
              <Modal.Footer className="border-0">
                <Button 
                  variant="secondary" 
                  onClick={() => proceed(false)}
                >
                  {cancelButtonText}
                </Button>
                <Button 
                  variant="danger" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Please wait...' : confirmButtonText}
                </Button>
              </Modal.Footer>
            </Form>
         )}
        </Formik>
      </Modal>
    )
  }

  return (
    <Modal 
      show={show} 
      onHide={() => proceed(false)}
      className=""
    >
      <Modal.Header className="border-0" closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{confirmation}</p>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button 
          variant="secondary" 
          onClick={() => proceed(false)}
        >
          {cancelButtonText}
        </Button>
        <Button 
          variant="danger" 
          onClick={() => proceed(true)}
        >
          {confirmButtonText}
        </Button>
      </Modal.Footer>
    </Modal>
  )
};

Dialog.propTypes = {
  inputs: PropTypes.array,
  show: PropTypes.bool,            // from confirmable. indicates if the dialog is shown or not.
  proceed: PropTypes.func,         // from confirmable. call to close the dialog with promise resolved.
  title: PropTypes.string,
  confirmation: PropTypes.string,  // arguments of your confirm function
  options: PropTypes.object        // arguments of your confirm function
};

// confirmable HOC pass props `show`, `dismiss`, `cancel` and `proceed` to your component.
export default confirmable(Dialog);