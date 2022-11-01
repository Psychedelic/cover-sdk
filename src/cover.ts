import {ActorSubclass, AnonymousIdentity, Certificate, HttpAgent, SignIdentity} from '@dfinity/agent';
import {Principal} from '@dfinity/principal';
import fetch from 'isomorphic-fetch';

import {
  AnonymousBuildConfigRequest,
  AnonymousBuildRequest,
  AnonymousBuildWithConfigRequest,
  BuildConfigRequest,
  BuildRequest,
  BuildWithConfigRequest,
  CoverMetadataRequest
} from 'type';

import {createCoverActor, createCoverMetadataActor} from './actor';
import {
  _SERVICE,
  ActivityPagination,
  BuildConfig,
  CoverMetadata,
  PaginationInfo,
  Stats,
  Verification,
  VerificationPagination
} from './actor/idl/cover.did.type';
import {developmentConfig, productionConfig} from './coverConfig';
import {validatorAxios} from './customAxios';
import {errHandler, getPublicKey, sign} from './utils';

interface CoverConfig {
  isDevelopment: boolean;
}

export class Cover {
  private readonly identity: SignIdentity;

  private readonly coverConfig = productionConfig;

  private coverActor: ActorSubclass<_SERVICE>;

  constructor(identity: SignIdentity, coverConfig?: CoverConfig) {
    if (coverConfig?.isDevelopment) {
      this.coverConfig = developmentConfig;
    }
    this.identity = identity;
    this.coverActor = createCoverActor(this.identity, this.coverConfig);
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
    const agent = new HttpAgent({host: this.coverConfig.icHost, fetch});

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

  async getActivities(paginationInfo: PaginationInfo): Promise<ActivityPagination> {
    return this.coverActor.getActivities(paginationInfo);
  }

  async getMyBuildConfigById(canisterId: Principal): Promise<BuildConfig | undefined> {
    return this.coverActor.getMyBuildConfigById(canisterId).then(buildConfig => buildConfig[0]);
  }

  async getMyBuildConfigs(): Promise<Array<BuildConfig>> {
    return this.coverActor.getMyBuildConfigs();
  }

  async deleteMyBuildConfig(canisterId: Principal): Promise<void> {
    return this.coverActor.deleteMyBuildConfig(canisterId);
  }

  async coverMetadata(canisterId: Principal): Promise<CoverMetadata> {
    const actor = createCoverMetadataActor(this.identity, canisterId);
    return actor.coverMetadata();
  }

  static async anonymousCoverMetadata(canisterId: Principal): Promise<CoverMetadata> {
    const actor = createCoverMetadataActor(new AnonymousIdentity(), canisterId);
    return actor.coverMetadata();
  }

  async saveBuildConfig(buildConfigRequest: BuildConfigRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.coverConfig.validatorUrl}/save-build-config`, {
        canisterId: buildConfigRequest.canisterId,
        canisterName: buildConfigRequest.canisterName,
        repoUrl: buildConfigRequest.repoUrl,
        commitHash: buildConfigRequest.commitHash,
        dfxVersion: buildConfigRequest.dfxVersion,
        rustVersion: buildConfigRequest.rustVersion,
        optimizeCount: buildConfigRequest.optimizeCount,
        callerId: this.identity.getPrincipal().toText(),
        delegateCanisterId: buildConfigRequest.delegateCanisterId,
        repoAccessToken: buildConfigRequest.repoAccessToken,
        publicKey,
        signature,
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async anonymousSaveBuildConfig(
    buildConfigRequest: AnonymousBuildConfigRequest,
    coverConfig?: CoverConfig
  ): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/save-build-config`, {
        canisterId: buildConfigRequest.canisterId,
        canisterName: buildConfigRequest.canisterName,
        repoUrl: buildConfigRequest.repoUrl,
        commitHash: buildConfigRequest.commitHash,
        dfxVersion: buildConfigRequest.dfxVersion,
        rustVersion: buildConfigRequest.rustVersion,
        optimizeCount: buildConfigRequest.optimizeCount,
        callerId: buildConfigRequest.callerId,
        delegateCanisterId: buildConfigRequest.delegateCanisterId,
        repoAccessToken: buildConfigRequest.repoAccessToken,
        publicKey: buildConfigRequest.publicKey,
        signature: buildConfigRequest.signature,
        timestamp: buildConfigRequest.timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async build(buildRequest: BuildRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.coverConfig.validatorUrl}/build`, {
        canisterId: buildRequest.canisterId,
        canisterName: buildRequest.canisterName,
        repoUrl: buildRequest.repoUrl,
        commitHash: buildRequest.commitHash,
        dfxVersion: buildRequest.dfxVersion,
        rustVersion: buildRequest.rustVersion,
        optimizeCount: buildRequest.optimizeCount,
        callerId: this.identity.getPrincipal().toText(),
        delegateCanisterId: buildRequest.delegateCanisterId,
        repoAccessToken: buildRequest.repoAccessToken,
        publicKey,
        signature,
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async anonymousBuild(buildRequest: AnonymousBuildRequest, coverConfig?: CoverConfig): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/build`, {
        canisterId: buildRequest.canisterId,
        canisterName: buildRequest.canisterName,
        repoUrl: buildRequest.repoUrl,
        commitHash: buildRequest.commitHash,
        dfxVersion: buildRequest.dfxVersion,
        rustVersion: buildRequest.rustVersion,
        optimizeCount: buildRequest.optimizeCount,
        callerId: buildRequest.callerId,
        delegateCanisterId: buildRequest.delegateCanisterId,
        repoAccessToken: buildRequest.repoAccessToken,
        publicKey: buildRequest.publicKey,
        signature: buildRequest.signature,
        timestamp: buildRequest.timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async buildWithConfig(buildWithConfigRequest: BuildWithConfigRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.coverConfig.validatorUrl}/build-with-config`, {
        canisterId: buildWithConfigRequest.canisterId,
        repoAccessToken: buildWithConfigRequest.repoAccessToken,
        callerId: this.identity.getPrincipal().toText(),
        publicKey,
        signature,
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async anonymousBuildWithConfig(
    buildWithConfigRequest: AnonymousBuildWithConfigRequest,
    coverConfig?: CoverConfig
  ): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/build-with-config`, {
        canisterId: buildWithConfigRequest.canisterId,
        repoAccessToken: buildWithConfigRequest.repoAccessToken,
        publicKey: buildWithConfigRequest.publicKey,
        signature: buildWithConfigRequest.signature,
        callerId: buildWithConfigRequest.callerId,
        timestamp: buildWithConfigRequest.timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async buildWithCoverMetadata(
    coverMetadataRequest: CoverMetadataRequest,
    coverConfig?: CoverConfig
  ): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/build-with-cover-metadata`, {
        canisterId: coverMetadataRequest.canisterId,
        repoAccessToken: coverMetadataRequest.repoAccessToken
      })
      .then(() => undefined)
      .catch(errHandler);
  }
}
