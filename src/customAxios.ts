import axios from 'axios';

export const validatorAxios = axios.create({
  headers: {'content-type': 'application/json'}
});
