import thunk from 'redux-thunk';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import logger from 'redux-logger';
import appReducer, { servicesMiddleware } from './redux/reducers';
import { name as key } from '../../package.json';

const persistConfig = {
  key: `${key}-mode-${import.meta.env['DEV'] ? 'true' : 'false'}`,
  storage
};

const rootReducer = (state, action) => {
  if (action.type === 'USER_LOGOUT') {
    const {  } = state
    state = {  };
  }

  return appReducer(state, action);
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: [
    thunk,
    // logger,
    ...servicesMiddleware,
  ],
});

let persistor = persistStore(store);

export {
  store,
  persistor,
};