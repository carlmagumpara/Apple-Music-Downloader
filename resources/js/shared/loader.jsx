import { TailSpin } from  'react-loader-spinner';

function Loader() {
  return (
    <div className="d-flex align-items-center justify-content-center">
      <TailSpin
        height="30"
        width="30"
        color="#4fa94d"
        ariaLabel="tail-spin-loading"
        radius="1"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
}

export default Loader;