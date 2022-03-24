import {ActorSubclass, AnonymousIdentity, Certificate, HttpAgent, Identity} from "@dfinity/agent";
import {
  BuildConfig,
  ManualReply,
  ManualReply_1,
  PaginationInfo,
  SaveBuildConfig,
  Stats,
  Verification,
  _SERVICE
} from "./actor/factory.d";
import {Principal} from "@dfinity/principal";
import {config} from "./config";
import {createActor} from "./actor/coverActor";
import {errHandler} from "./utils";
import {validatorAxios} from "./customAxios";

export class Cover {
  private readonly identity: Identity;
  private coverActor: ActorSubclass<_SERVICE>;

  constructor(identity?: Identity) {
    this.identity = identity || new AnonymousIdentity();
    this.coverActor = createActor(this.identity);
  }

  async verify(canisterId: Principal): Promise<boolean> {
    const coverHash = await this.getCoverHash(canisterId);
    const icHash = await this.getICHash(canisterId);

    return icHash === coverHash;
  }

  async getAllVerifications(paginationInfo: PaginationInfo): Promise<ManualReply_1> {
    return this.coverActor.getVerifications(paginationInfo);
  }

  async getVerificationStats(): Promise<Stats> {
    return this.coverActor.getVerificationsStats();
  }

  async getVerificationByCanisterId(canisterId: Principal): Promise<[] | [Verification]> {
    return this.coverActor.getVerificationByCanisterId(canisterId);
  }

  async getCoverHash(canisterId: Principal): Promise<string> {
    const verification = await this.getVerificationByCanisterId(canisterId);
    if (verification[0] === undefined || verification[0].wasm_hash === undefined) {
      return "";
    }

    return verification[0].wasm_hash[0] as string;
  }

  async getICHash(canisterId: Principal): Promise<string> {
    const agent = new HttpAgent({host: config.icHost, fetch});

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
    return `0x${Buffer.from(hashBuffer as ArrayBuffer).toString("hex")}`;
  }

  // return caller's build config by canister ID
  async getBuildConfigById(canisterId: Principal): Promise<[] | [BuildConfig]> {
    return this.coverActor.getBuildConfigById(canisterId);
  }

  async getBuildConfigs(): Promise<Array<BuildConfig>> {
    return this.coverActor.getBuildConfigs();
  }

  async deleteBuildConfig(canisterId: Principal): Promise<void> {
    return this.coverActor.deleteBuildConfig(canisterId);
  }

  async saveBuildConfig(
    buildConfig: SaveBuildConfig,
    repoAccessToken: string,
    publicKey: string,
    signature: string
  ): Promise<void> {
    return validatorAxios
      .post(`${config.validatorUrl}/save-build-config`, {
        canisterId: buildConfig.canister_id.toString(),
        canisterName: buildConfig.canister_name,
        repoUrl: buildConfig.repo_url,
        commitHash: buildConfig.commit_hash,
        dfxVersion: buildConfig.dfx_version,
        rustVersion: buildConfig.rust_version[0] || "",
        optimizeCount: buildConfig.optimize_count,
        ownerId: buildConfig.owner_id.toString(),
        repoAccessToken,
        publicKey,
        signature
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async build(
    buildConfig: SaveBuildConfig,
    repoAccessToken: string,
    publicKey: string,
    signature: string
  ): Promise<void> {
    return validatorAxios
      .post(`${config.validatorUrl}/build`, {
        canisterId: buildConfig.canister_id.toString(),
        canisterName: buildConfig.canister_name,
        repoUrl: buildConfig.repo_url,
        commitHash: buildConfig.commit_hash,
        dfxVersion: buildConfig.dfx_version,
        rustVersion: buildConfig.rust_version[0] || "",
        optimizeCount: buildConfig.optimize_count,
        ownerId: buildConfig.owner_id.toString(),
        repoAccessToken,
        publicKey,
        signature
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async buildWithConfig(
    canisterId: string,
    repoAccessToken: string,
    publicKey: string,
    signature: string,
    ownerId: string
  ): Promise<void> {
    return validatorAxios
      .post(`${config.validatorUrl}/build-with-config`, {
        canisterId,
        repoAccessToken,
        publicKey,
        signature,
        ownerId
      })
      .then(() => undefined)
      .catch(errHandler);
  }

  async getActivities(paginationInfo: PaginationInfo): Promise<ManualReply> {
    return this.coverActor.getActivities(paginationInfo);
  }
}
