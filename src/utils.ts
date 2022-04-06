import {AxiosError} from "axios";

import {NoResponse, UnexpectedError} from "./type/errorResponse";

export const errHandler = (error: AxiosError) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw error.response.data;
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    throw NoResponse;
  }
  // Something happened in setting up the request that triggered an Error
  throw UnexpectedError;
};
