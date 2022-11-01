import type { ActorMethod } from '@dfinity/agent';

export interface CoverMetadata {
  'controller' : [] | [string],
  'dfx_version' : string,
  'canister_name' : string,
  'commit_hash' : string,
  'repo_url' : string,
  'rust_version' : [] | [string],
  'optimize_count' : number,
}
export interface _SERVICE {
  'coverMetadata' : ActorMethod<[], CoverMetadata>,
}
