import type {ActorMethod} from '@dfinity/agent';
import type {Principal} from '@dfinity/principal';

export interface CoverMetadata {
  dfx_version: string;
  canister_name: string;
  commit_hash: string;
  repo_url: string;
  rust_version: [] | [string];
  optimize_count: number;
}
export interface _SERVICE {
  coverMetadata: ActorMethod<[], CoverMetadata>;
}
