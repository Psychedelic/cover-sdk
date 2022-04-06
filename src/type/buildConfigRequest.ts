export interface buildConfigRequest {
  canister_id: string;
  dfx_version: string;
  owner_id: string;
  canister_name: string;
  commit_hash: string;
  repo_url: string;
  rust_version: string | undefined;
  optimize_count: number;
  repo_access_token: string;
}
