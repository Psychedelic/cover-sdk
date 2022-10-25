export interface BuildWithConfigRequest {
  repoAccessToken: string;
  canisterId: string;
}

export interface AnonymousBuildWithConfigRequest extends BuildWithConfigRequest {
  callerId: string;
  publicKey: string;
  signature: string;
  timestamp: number;
}
