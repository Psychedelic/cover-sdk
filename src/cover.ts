import {ActorSubclass, Certificate, HttpAgent, SignIdentity} from '@dfinity/agent';
import {Principal} from '@dfinity/principal';
import fetch from 'isomorphic-fetch';

import {createActor} from './actor/coverActor';
import {
  _SERVICE,
  ActivityPagination,
  BuildConfig,
  PaginationInfo,
  Stats,
  Verification,
  VerificationPagination
} from './actor/idl/cover.did.type';
import {developmentConfig, productionConfig} from './config';
import {validatorAxios} from './customAxios';
import {AnonymousBuildRequest, BuildRequest} from './type/buildRequest';
import {errHandler, getPublicKey, sign} from './utils';

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

    return coverHash !== undefined && coverHash === icHash;
  }

  async getAllVerifications(paginationInfo: PaginationInfo): Promise<VerificationPagination> {
    return this.coverActor.getVerifications(paginationInfo);
  }

  async getVerificationStats(): Promise<Stats> {
    return this.coverActor.getVerificationsStats();
  }

  async getVerificationByCanisterId(canisterId: Principal): Promise<Verification | undefined> {
    return this.coverActor.getVerificationByCanisterId(canisterId).then(verification => verification[0]);
  }

  async getCoverHash(canisterId: Principal): Promise<string | undefined> {
    const verification = await this.getVerificationByCanisterId(canisterId);
    if (!verification || verification.wasm_hash.length < 1) {
      return undefined;
    }

    return verification.wasm_hash[0] as string;
  }

  async getICHash(canisterId: Principal): Promise<string | undefined> {
    const agent = new HttpAgent({host: this.config.icHost, fetch});

    const path = [
      new TextEncoder().encode('canister'),
      canisterId.toUint8Array(),
      new TextEncoder().encode('module_hash')
    ];

    const {certificate} = await agent.readState(canisterId, {
      paths: [path]
    });
    const cert = await Certificate.create({certificate, rootKey: agent.rootKey, canisterId});
    const hashBuffer = cert.lookup(path);
    return hashBuffer && `0x${Buffer.from(hashBuffer as ArrayBuffer).toString('hex')}`;
  }

  async getBuildConfigByCanisterId(canisterId: Principal): Promise<BuildConfig | undefined> {
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
        canisterId: buildConfig.canisterId,
        canisterName: buildConfig.canisterName,
        repoUrl: buildConfig.repoUrl,
        commitHash: buildConfig.commitHash,
        dfxVersion: buildConfig.dfxVersion,
        rustVersion: buildConfig.rustVersion,
        optimizeCount: buildConfig.optimizeCount,
        callerId: this.identity.getPrincipal().toText(),
        delegateCanisterId: buildConfig.delegateCanisterId,
        repoAccessToken: buildConfig.repoAccessToken,
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
        canisterId: buildConfig.canisterId,
        canisterName: buildConfig.canisterName,
        repoUrl: buildConfig.repoUrl,
        commitHash: buildConfig.commitHash,
        dfxVersion: buildConfig.dfxVersion,
        rustVersion: buildConfig.rustVersion,
        optimizeCount: buildConfig.optimizeCount,
        callerId: this.identity.getPrincipal().toText(),
        delegateCanisterId: buildConfig.delegateCanisterId,
        repoAccessToken: buildConfig.repoAccessToken,
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
        canisterId: buildConfig.canisterId,
        canisterName: buildConfig.canisterName,
        repoUrl: buildConfig.repoUrl,
        commitHash: buildConfig.commitHash,
        dfxVersion: buildConfig.dfxVersion,
        rustVersion: buildConfig.rustVersion,
        optimizeCount: buildConfig.optimizeCount,
        callerId: buildConfig.callerId,
        delegateCanisterId: buildConfig.delegateCanisterId,
        repoAccessToken: buildConfig.repoAccessToken,
        publicKey: buildConfig.publicKey,
        signature: buildConfig.signature,
        timestamp: buildConfig.timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async buildWithConfig(canisterId: string, repoAccessToken: string): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.config.validatorUrl}/build-with-config`, {
        canisterId,
        repoAccessToken,
        publicKey,
        signature,
        callerId: this.identity.getPrincipal().toText(),
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async buildWithCoverMetadata(
    canisterId: string,
    repoAccessToken: string,
    coverConfig?: CoverConfig
  ): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/build-with-cover-metadata`, {
        canisterId,
        repoAccessToken
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async getActivities(paginationInfo: PaginationInfo): Promise<ActivityPagination> {
    return this.coverActor.getActivities(paginationInfo);
  }
}
