import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// import 'bootstrap/dist/css/bootstrap.min.css';
import 'src/bootstrap-themes/bootstrap.min (8).css';
import 'react-placeholder/lib/reactPlaceholder.css';
import 'react-datetime/css/react-datetime.css';
import 'src/index.scss';

import App from "src/App";

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';

import { store, persistor } from 'src/store';
import { AntMessageProvider } from 'src/context/ant-message';

const root = createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <AntMessageProvider>
          <App />
        </AntMessageProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>  
);