import { combineReducers } from 'redux';
import userReducer from './user';
import tokenReducer from './token';
import { appleMusicApi } from '../services/apple-music';

const apis = [
  appleMusicApi
];

const appReducer = combineReducers({
  user: userReducer,
  token: tokenReducer,
  ...apis.reduce((acc, curr) => {
    acc[curr.reducerPath] = curr.reducer;
    return acc;
  }, {}),
});

export const servicesMiddleware = apis.map(curr => curr.middleware);

export default appReducer;