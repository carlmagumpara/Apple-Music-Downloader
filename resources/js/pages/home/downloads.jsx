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
    <div id="folder">
      {data ? (
        <>
          {(data?.data?.files.length === data?.data?.links?.length) ? (
            <div className="text-center mb-5">
              <p>Your download link is ready...</p>
              <Button
                onClick={() => window.location.href = `/api/downloader/apple-music/download-zip?zip_name=${folder}`}
              >
                Download Zip
              </Button>
            </div>
          ) : <p className="text-center mb-5"><Hourglass /> Fetched ({data?.data?.files.length}/{data?.data?.links?.length})...</p>}
          <ListGroup className="mb-5" variant="flush">
            {files.map(item => (
              <ListGroup.Item key={item.url}>
                <div className="d-flex">
                  <div className="flex-shrink-0">
                    <img style={{ width: 50 }} src={item.picture} alt={item.title} className="rounded border" />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="mb-0">{item.track}. {item.title}</h5>
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
  )
}

export default Downloads;