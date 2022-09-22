export interface BuildRequest {
  canisterId: string;
  dfxVersion: string;
  delegateCanisterId: string;
  canisterName: string;
  commitHash: string;
  repoUrl: string;
  rustVersion: string;
  optimizeCount: number;
  repoAccessToken: string;
}

export interface AnonymousBuildRequest extends BuildRequest {
  callerId: string;
  timestamp: number;
  signature: string;
  publicKey: string;
}
