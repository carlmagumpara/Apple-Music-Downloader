import './App.scss';

import { Routes, Route } from 'react-router-dom';

// Middleware
import PrivateRoute from 'src/pages/components/PrivateRoute';
import GuestRoute from 'src/pages/components/GuestRoute';

// Wrapper
import Wrapper from 'src/pages/components/Wrapper';

// Pages
import NotFound from 'src/pages/not-found';
import Home from 'src/pages/home';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='*' element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/downloads/:folder" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
