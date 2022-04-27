import {Actor, ActorSubclass, HttpAgent, Identity} from "@dfinity/agent";
import fetch from "isomorphic-fetch";

import {config} from "../config";
import {idlFactory} from "./factory";
import {_SERVICE as Service} from "./factoryType";

export function createActor(identity: Identity): ActorSubclass<Service> {
  const agent = new HttpAgent({host: config.icHost, fetch, identity});

  return Actor.createActor<Service>(idlFactory, {
    canisterId: config.coverCanisterId,
    agent
  });
}
