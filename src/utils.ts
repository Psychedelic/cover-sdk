import {SignIdentity} from "@dfinity/agent";
import {AxiosError} from "axios";

import {NoResponse, UnexpectedError} from "./type/errorResponse";
import {PublicKey} from "./type/publicKey";

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

export const getPublicKey = (identity: SignIdentity): string => {
  const publicKey = identity.getPublicKey() as PublicKey;
  return Buffer.from(publicKey.toRaw()).toString("hex");
};

export const sign = async (identity: SignIdentity, timestamp: number): Promise<string> =>
  identity.sign(Buffer.from(timestamp.toString())).then(s => Buffer.from(s).toString("hex"));
