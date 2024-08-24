import logo from 'src/assets/logo.png';

function LogoLoader() {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 vw-100">
      <div className="text-center">
        <img src={logo} width={100} className="mb-3" />
        <p>Please wait...</p>
      </div>
    </div>
  );
}

export default LogoLoader;