import {Actor, ActorSubclass, HttpAgent, Identity} from '@dfinity/agent';
import fetch from 'isomorphic-fetch';

import {EnvConfig} from '../config';
import {idlFactory} from './idl/cover.did';
import {_SERVICE as Service} from './idl/cover.did.d';

export const createActor = (identity: Identity, config: EnvConfig): ActorSubclass<Service> => {
  const agent = new HttpAgent({host: config.icHost, fetch, identity});

  return Actor.createActor<Service>(idlFactory, {
    canisterId: config.coverCanisterId,
    agent
  });
};
