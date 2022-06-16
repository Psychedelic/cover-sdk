import {DerEncodedPublicKey} from '@dfinity/agent/lib/esm/auth';

export interface PublicKey {
  toDer(): DerEncodedPublicKey;
  toRaw(): ArrayBuffer;
}
