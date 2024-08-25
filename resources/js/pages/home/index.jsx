import { useState } from 'react';
import { Container, Form, Button, InputGroup, Image, ListGroup } from 'react-bootstrap';
import moment from 'moment';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAntMessage } from 'src/context/ant-message';
import { useGenerateMutation, useExtractMutation } from 'src/redux/services/apple-music';
import { ProgressBar, Hourglass } from 'react-loader-spinner';
import { Buffer } from 'buffer';
import mime from 'mime-types';
import { saveAs } from 'file-saver';
import LoadingOverlay from 'react-loading-overlay-ts';
import { v4 as uuidv4 } from 'uuid';
import apple_music from 'src/assets/apple-music.png';
import download from 'src/assets/download-2486_512.gif';

function Index() {
  const [status, setStatus] = useState(null);
  const [files, setFiles] = useState([]);
  const [zip_name, setZipName] = useState(null);
  const [extract] = useExtractMutation();
  const [generate] = useGenerateMutation();

  const awaitableJsmediatags = (file) => new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => resolve(tag.tags),
      onError: (error) => resolve({}),
    });
  });

  const delay = t => new Promise(resolve => setTimeout(resolve, t));

  const onSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const key = uuidv4();
      setSubmitting(true);
      setStatus('Please wait this may take a few minutes');
      await delay(3000);
      const response = await extract(values).unwrap();
      setStatus(`${response.data.album_links.length} files found`);
      const files = await Promise.all(response.data.album_links.map(async (item, index) => {
        const { data } = await generate({ url: item, key }).unwrap();

        console.log('data', data);

        // const { picture, ...res } = await awaitableJsmediatags(data.files[index]);
        // setStatus(`Fetching ${index + 1} out of ${response.data.album_links.length}`);
        // return { 
        //   picture: `data:${picture.format};base64,${Buffer.from(picture.data).toString("base64")}`,
        //   url: data.files[index],
        //   ...res,
        // }
      }));
      // setStatus('Your download link is ready...');
      // setFiles(files);
      // setZipName(`${key}`);
      // setTimeout(() => {
      //   setSubmitting(false);
      // }, 1000);
    } catch (error) {
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
        <LoadingOverlay
          active={isSubmitting}
          spinner={
            <Hourglass
              visible={true}
              height={50}
              width={50}
              ariaLabel="hourglass-loading"
              wrapperStyle={{}}
              wrapperClass="me-3"
              colors={['#ffffff', '#72a1ed']}
            />
          }
          text={status}
        >
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
              {(zip_name && files.length !== 0) ? (
                <>
                  <div className="text-center mb-5">
                    <p>Your download link is ready...</p>
                    <Button
                      onClick={() => window.location.href = `/api/downloader/apple-music/download?zip_name=${zip_name}`}
                    >
                      Download Zip
                    </Button>
                  </div>
                  <ListGroup className="mb-5" variant="flush">
                    {files.map(item => (
                      <ListGroup.Item>
                        <div className="d-flex">
                          <div className="flex-shrink-0">
                            <img style={{ width: 50 }} src={item.picture} alt={item.title} className="rounded border" />
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h5 className="mb-0">{item.title}</h5>
                            <p className="mb-0">{item.artist} | {item.album}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => saveAs(item.url, `${item.track}. ${item.title} - ${item.artist}.${item.url.split('.').pop()}`)}
                          >
                            Download
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </>
              ) : null}
            </div>
          </Container>
        </LoadingOverlay>
     )}
    </Formik>
  );
}

export default Index;