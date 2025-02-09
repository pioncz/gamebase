import axios from 'axios';

export const BASE_URL = 'http://localhost:3001/';

export const postLogin = (payload: {
  email: string;
  password: string;
}): Promise<null> =>
  axios.post('/api/players/login', payload).then((res) => res.data);

export const postRegister = (payload: {
  email: string;
  password: string;
}): Promise<null> =>
  axios
    .post('/api/players/register', payload)
    .then((res) => res.data);
