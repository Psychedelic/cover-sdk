import {Actor, ActorSubclass, HttpAgent, Identity} from "@dfinity/agent";
import {_SERVICE as Service} from "./factory.d";
import {config} from "../config";
import fetch from "isomorphic-fetch";
import {idlFactory} from "./factory";

export function createActor(identity: Identity): ActorSubclass<Service> {
  const agent = new HttpAgent({host: config.icHost, fetch, identity});

  return Actor.createActor<Service>(idlFactory, {
    canisterId: config.coverCanisterId,
    agent
  });
}
