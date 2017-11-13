import axios from 'axios';
import createCancellableRequest from './request';

export default function createHttpClient(store, config = {}) {
  axios.interceptors.response.use(
    response => response,
    (error) => {
      // Do something with response error

      return Promise.reject(error);
    },
  );

  Object.keys(config).forEach((key) => {
    axios.defaults[key] = config[key];
  });

  // cancellable is our custom method and is not part of axios API
  axios.cancellable = createCancellableRequest(axios);

  return axios;
}
