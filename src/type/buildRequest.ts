export interface BuildRequest {
  canister_id: string;
  dfx_version: string;
  owner_id: string;
  delegate_canister_id: string;
  canister_name: string;
  commit_hash: string;
  repo_url: string;
  rust_version: string;
  optimize_count: number;
  repo_access_token: string;
}

export interface AnonymousBuildRequest extends BuildRequest {
  timestamp: number;
  signature: string;
  public_key: string;
}
