import { useState } from 'react';
import { Container, Form, Button, InputGroup, Image, ListGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAntMessage } from 'src/context/ant-message';
import { useGenerateMutation } from 'src/redux/services/apple-music';
import { ProgressBar } from 'react-loader-spinner';
import apple_music from 'src/assets/apple-music.png';
import Downloads from './downloads';

function Index() {
  const navigate = useNavigate();
  const { folder } = useParams();
  const [status, setStatus] = useState(null);
  const [generate] = useGenerateMutation();

  const onSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      setSubmitting(true);
      const response = await generate(values).unwrap();
      navigate(`/downloads/${response.data.name}#folder`);
      setSubmitting(false);
    } catch (error) {
      console.log(error);
      if (error.response.status === 422) {
        setErrors(error.response.data.errors);
      }
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ 
        url: '', 
      }}
      validationSchema={Yup.object().shape({
        url: Yup.string()
          .url('Please enter a valid Apple music link.')
          .matches(/^https:\/\/music\.apple\.com\/ph\/album\//, 'URL must start with https://music.apple.com/ph/album/')
          .required('URL is required'),
      })}
      onSubmit={onSubmit}
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
      <Container style={{ minHeight: '100vh' }} className="d-flex justify-content-center align-items-center">
        <div>
          <div className="text-center pt-5 mb-5">
            <Image 
              src={apple_music} 
              style={{ width: 200 }} 
              className="floating mb-5"
            />
            <h1 className="display-5">Apple Music Downloader</h1>
            <p>Download original apple music file for Free.</p>
          </div>
            <Form onSubmit={handleSubmit} autoComplete="new-off">
              <div className="d-flex justify-content-center align-items-center">
                <Form.Group 
                  className="mb-3 position-relative w-100" 
                >
                  <InputGroup className="mb-3">
                    <Form.Control 
                      name="url"
                      placeholder="Ex: https://music.apple.com/ph/album/talaarawan-ep/1733853209"
                      value={values.url}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.url && touched.url && 'is-invalid'}
                      style={{ height: 80 }}
                      disabled={isSubmitting}
                    />
                    <Button disabled={isSubmitting} variant="primary" type="submit" className="pt-0 pb-0">
                      {isSubmitting ? (
                        <ProgressBar
                          visible={isSubmitting}
                          height={80}
                          width={80}
                          color="#4fa94d"
                          ariaLabel="progress-bar-loading"
                          wrapperStyle={{}}
                          wrapperClass=""
                        />
                      ) : 'Download'}
                    </Button>
                    {errors.url && touched.url && <Form.Control.Feedback type="invalid" tooltip>{errors.url}</Form.Control.Feedback>}
                  </InputGroup>
                </Form.Group>
              </div>
            </Form> 
            {folder ? (
              <Downloads
                folder={folder}
              />
            ) : null}
        </div>
      </Container>
     )}
    </Formik>
  );
}

export default Index;