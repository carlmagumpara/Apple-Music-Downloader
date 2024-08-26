import { useState, useEffect } from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { saveAs } from 'file-saver';
import { useGetFilesQuery } from 'src/redux/services/apple-music';
import { Buffer } from 'buffer';
import LoadingOverlay from 'react-loading-overlay-ts';
import { Hourglass } from 'react-loader-spinner';

function Downloads({ folder }) {
  const [files, setFiles] = useState([]);
  const { data, error, isLoading, isFetching, refetch } =  useGetFilesQuery({ folder }, {
    pollingInterval: 3000,
    skipPollingIfUnfocused: true,
  });

  const awaitableJsmediatags = (file) => new Promise((resolve, reject) => {
    jsmediatags.read(file, {
      onSuccess: (tag) => resolve(tag.tags),
      onError: (error) => resolve({}),
    });
  });

  useEffect(() => {
    const getFileInformation = async () => {
      const _files = await Promise.all((data?.data?.files ?? []).map(async (item, index) => {
        const { picture, ...res } = await awaitableJsmediatags(item);

        return { 
          picture: `data:${picture?.format};base64,${Buffer.from(picture?.data).toString("base64")}`,
          url: item,
          ...res,
        }
      }));

      setFiles(_files);
    };

    if (data?.data?.files) {
      getFileInformation();
    }
  }, [data, folder]);


  useEffect(() => {
    refetch();
  }, []);

  return (
    <LoadingOverlay
      active={isLoading}
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
      <div id="folder">
        {files.length !== 0 ? (
          <>
            <div className="text-center mb-5">
              <p>Your download link is ready...</p>
              <Button
                onClick={() => window.location.href = `/api/downloader/apple-music/download-zip?zip_name=${folder}`}
              >
                Download Zip
              </Button>
            </div>
            <ListGroup className="mb-5" variant="flush">
              {files.map(item => (
                <ListGroup.Item key={item.url}>
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
    </LoadingOverlay>
  )
}

export default Downloads;