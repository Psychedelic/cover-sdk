import {ActorSubclass, AnonymousIdentity, Certificate, HttpAgent, SignIdentity} from '@dfinity/agent';
import {Principal} from '@dfinity/principal';
import fetch from 'isomorphic-fetch';

import {AnonymousBuildRequest, AnonymousBuildWithConfigRequest, BuildRequest, BuildWithConfigRequest} from 'type';

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

  async getBuildConfigByCanisterId(canisterId: Principal): Promise<BuildConfig | undefined> {
    return this.coverActor.getBuildConfigById(canisterId).then(buildConfig => buildConfig[0]);
  }

  async getBuildConfigs(): Promise<Array<BuildConfig>> {
    return this.coverActor.getBuildConfigs();
  }

  async deleteBuildConfig(canisterId: Principal): Promise<void> {
    return this.coverActor.deleteBuildConfig(canisterId);
  }

  async coverMetadata(canisterId: Principal): Promise<CoverMetadata> {
    const actor = createCoverMetadataActor(this.identity, canisterId);
    return actor.coverMetadata();
  }

  static async anonymousCoverMetadata(canisterId: Principal): Promise<CoverMetadata> {
    const actor = createCoverMetadataActor(new AnonymousIdentity(), canisterId);
    return actor.coverMetadata();
  }

  async saveBuildConfig(buildConfig: BuildRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.coverConfig.validatorUrl}/save-build-config`, {
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

  static async anonymousSaveBuildConfig(buildConfig: AnonymousBuildRequest, coverConfig?: CoverConfig): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/save-build-config`, {
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

  async build(buildConfig: BuildRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.coverConfig.validatorUrl}/build`, {
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

  async buildWithConfig(buildWithConfig: BuildWithConfigRequest): Promise<void> {
    const publicKey = getPublicKey(this.identity);
    const timestamp = new Date().getTime();
    const signature = await sign(this.identity, timestamp);
    return validatorAxios
      .post(`${this.coverConfig.validatorUrl}/build-with-config`, {
        canisterId: buildWithConfig.canisterId,
        repoAccessToken: buildWithConfig.repoAccessToken,
        callerId: this.identity.getPrincipal().toText(),
        publicKey,
        signature,
        timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async anonymousBuildWithConfig(
    buildWithConfig: AnonymousBuildWithConfigRequest,
    coverConfig?: CoverConfig
  ): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/build-with-config`, {
        canisterId: buildWithConfig.canisterId,
        repoAccessToken: buildWithConfig.repoAccessToken,
        publicKey: buildWithConfig.publicKey,
        signature: buildWithConfig.signature,
        callerId: buildWithConfig.callerId,
        timestamp: buildWithConfig.timestamp
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  static async buildWithCoverMetadata(
    canisterId: string,
    repoAccessToken?: string,
    coverConfig?: CoverConfig
  ): Promise<void> {
    let config = productionConfig;
    if (coverConfig?.isDevelopment) {
      config = developmentConfig;
    }
    return validatorAxios
      .post(`${config.validatorUrl}/build-with-cover-metadata`, {
        canisterId,
        repoAccessToken: repoAccessToken || ''
      })
      .then(() => undefined)
      .catch(errHandler);
  }
}
