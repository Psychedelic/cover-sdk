import {ActorSubclass, Certificate, HttpAgent, SignIdentity} from "@dfinity/agent";
import {Principal} from "@dfinity/principal";
import fetch from "isomorphic-fetch";

import {createActor} from "./actor/coverActor";
import {
  ActivitiesPagination,
  BuildConfig,
  PaginationInfo,
  Stats,
  Verification,
  VerificationsPagination,
  _SERVICE
} from "./actor/factoryType";
import {developmentConfig, productionConfig} from "./config";
import {validatorAxios} from "./customAxios";
import {AnonymousBuildRequest, BuildRequest} from "./type/buildRequest";
import {errHandler, getPublicKey, sign} from "./utils";

interface CoverConfig {
  isDevelopment: boolean;
}

export class Cover {
  private readonly identity: SignIdentity;
  private readonly config = productionConfig;
  private coverActor: ActorSubclass<_SERVICE>;

  constructor(identity: SignIdentity, config?: CoverConfig) {
    if (config?.isDevelopment) {
      this.config = developmentConfig;
    }
    this.identity = identity;
    this.coverActor = createActor(this.identity, this.config);
  }

  async verify(canisterId: Principal): Promise<boolean> {
    const [coverHash, icHash] = await Promise.all([this.getCoverHash(canisterId), this.getICHash(canisterId)]);

    return coverHash === icHash;
  }

  async getAllVerifications(paginationInfo: PaginationInfo): Promise<VerificationsPagination> {
    return this.coverActor.getVerifications(paginationInfo);
  }

  async getVerificationStats(): Promise<Stats> {
    return this.coverActor.getVerificationsStats();
  }

  async getVerificationByCanisterId(canisterId: Principal): Promise<Verification | undefined> {
    return this.coverActor.getVerificationByCanisterId(canisterId).then(verification => verification[0]);
  }

  async getCoverHash(canisterId: Principal): Promise<string> {
    const verification = await this.getVerificationByCanisterId(canisterId);
    if (!verification || verification.wasm_hash.length < 1) {
      return "";
    }

    return verification.wasm_hash[0] as string;
  }

  async getICHash(canisterId: Principal): Promise<string | undefined> {
    const agent = new HttpAgent({host: this.config.icHost, fetch});

    const path = [
      new TextEncoder().encode("canister"),
      canisterId.toUint8Array(),
      new TextEncoder().encode("module_hash")
    ];

    const res = await agent.readState(canisterId, {
      paths: [path]
    });
    const cert = new Certificate(res, agent);
    await cert.verify();
    const hashBuffer = cert.lookup(path);
    return hashBuffer && `0x${Buffer.from(hashBuffer as ArrayBuffer).toString("hex")}`;
  }

  // return caller's build config by canister ID
  async getBuildConfigById(canisterId: Principal): Promise<BuildConfig | undefined> {
    return this.coverActor.getBuildConfigById(canisterId).then(config => config[0]);
  }

  async getBuildConfigs(): Promise<Array<BuildConfig>> {
    return this.coverActor.getBuildConfigs();
  }

  async deleteBuildConfig(canisterId: Principal): Promise<void> {
    return this.coverActor.deleteBuildConfig(canisterId);
  }

  async saveBuildConfig(buildConfig: BuildRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.config.validatorUrl}/save-build-config`, {
        canisterId: buildConfig.canister_id,
        canisterName: buildConfig.canister_name,
        repoUrl: buildConfig.repo_url,
        commitHash: buildConfig.commit_hash,
        dfxVersion: buildConfig.dfx_version,
        rustVersion: buildConfig.rust_version || "",
        optimizeCount: buildConfig.optimize_count,
        ownerId: buildConfig.owner_id,
        repoAccessToken: buildConfig.repo_access_token,
        publicKey,
        signature,
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async build(buildConfig: BuildRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.config.validatorUrl}/build`, {
        canisterId: buildConfig.canister_id,
        canisterName: buildConfig.canister_name,
        repoUrl: buildConfig.repo_url,
        commitHash: buildConfig.commit_hash,
        dfxVersion: buildConfig.dfx_version,
        rustVersion: buildConfig.rust_version || "",
        optimizeCount: buildConfig.optimize_count,
        ownerId: buildConfig.owner_id,
        repoAccessToken: buildConfig.repo_access_token,
        publicKey,
        signature,
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async anonymousBuild(buildConfig: AnonymousBuildRequest, coverConfig?: CoverConfig): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/build`, {
        canisterId: buildConfig.canister_id,
        canisterName: buildConfig.canister_name,
        repoUrl: buildConfig.repo_url,
        commitHash: buildConfig.commit_hash,
        dfxVersion: buildConfig.dfx_version,
        rustVersion: buildConfig.rust_version || "",
        optimizeCount: buildConfig.optimize_count,
        ownerId: buildConfig.owner_id,
        repoAccessToken: buildConfig.repo_access_token,
        publicKey: buildConfig.public_key,
        signature: buildConfig.signature,
        timestamp: buildConfig.timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async buildWithConfig(canisterId: string, repoAccessToken: string, ownerId: string): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.config.validatorUrl}/build-with-config`, {
        canisterId,
        repoAccessToken,
        publicKey,
        signature,
        ownerId,
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async getActivities(paginationInfo: PaginationInfo): Promise<ActivitiesPagination> {
    return this.coverActor.getActivities(paginationInfo);
  }
}
