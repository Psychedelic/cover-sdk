import {Actor, ActorSubclass, HttpAgent, Identity} from '@dfinity/agent';
import {Principal} from '@dfinity/principal';
import fetch from 'isomorphic-fetch';

import {EnvConfig, IC_HOST} from '../coverConfig';
import {idlFactory as coverIdlFactory} from './idl/cover.did';
import {_SERVICE as CoverService} from './idl/cover.did.type';
import {idlFactory as coverMetadataIdlFactory} from './idl/coverMetadata.did';
import {_SERVICE as CoverMetadataService} from './idl/coverMetadata.did.type';

export const createCoverActor = (identity: Identity, config: EnvConfig): ActorSubclass<CoverService> => {
  const agent = new HttpAgent({host: config.icHost, fetch, identity});

  return Actor.createActor<CoverService>(coverIdlFactory, {
    canisterId: config.coverCanisterId,
    agent
  });
};

export const createCoverMetadataActor = (
  identity: Identity,
  canisterId: Principal
): ActorSubclass<CoverMetadataService> => {
  const agent = new HttpAgent({host: IC_HOST, fetch, identity});

  return Actor.createActor<CoverMetadataService>(coverMetadataIdlFactory, {
    canisterId,
    agent
  });
};
