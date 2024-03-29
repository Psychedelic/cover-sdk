![](https://docs.covercode.ooo/overview/imgs/mainn.png)

# ✅ Cover SDK

Cover SDK is JavaScript and TypeScript client library for integrating the Cover protocol into applications.

Cover's SDK makes it easy to:

- Manage build configs
- Submit new builds
- Check a canister's verified status
- Query data from the Cover canister

... And more!

<br>

## Contents Table

- [Installation](#installation)
- [Import](#import)
- [API](#api)
- [Example](#typescript-example)

## Installation

- Install from npm

```bash
npm i @psychedelic/cover
```

## Import

- For CommonJS

```typescript
const {Cover} = require('@psychedelic/cover');
```

- For JavaScript Modules

```typescript
import {Cover} from '@psychedelic/cover';
```

## API

- Construct a new Cover object with your identity

```typescript
const cover = new Cover(identity: SignIdentity);
```

- Verify a canister

```typescript
cover.verify(canisterId: Principal): Promise<boolean>;
```

- Get wasm hash

```typescript
// wasm hash in Cover verification
cover.getCoverHash(canisterId: Principal): Promise<string | undefined>;

// wasm hash on IC network
cover.getICHash(canisterId: Principal): Promise<string | undefined>;
```

- Get Cover verification

```typescript
// provide a pagination info to get all verifications
// PaginationInfo {
//   items_per_page has Min value = 10 & Max = 120
//   page_index is start from 1
// }
cover.getAllVerifications(paginationInfo: PaginationInfo): Promise<VerificationPagination>;

// get verification by canister id
cover.getVerificationByCanisterId(canisterId: Principal): Promise<Verification | undefined>;

// get verification statistics
cover.getVerificationStats(): Promise<Stats>;

cover.getMyVerificationStats(): Promise<Stats>;
```

- APIs with pagination info parameter will return an object like this

```typescript
interface Pagination {
  page_index: bigint;
  data: Array<T>;
  total_pages: bigint;
  total_items: bigint;
  is_first_page: boolean;
  items_per_page: bigint;
  is_last_page: boolean;
}
```

- Interact with build configs of given identity (the identity passed in the Cover constructor)

```typescript
// get all build configs
cover.getMyBuildConfigs(): Promise<Array<BuildConfig>>;

// get build config by canister id
cover.getMyBuildConfigById(canisterId: Principal): Promise<BuildConfig | undefined>;

// delete a build config
cover.deleteMyBuildConfig(canisterId: Principal): Promise<void>;
```

- Get recent activities from Cover

```typescript
// provide a pagination info to get activities
// PaginationInfo {
//   items_per_page has Min value = 10 & Max = 120
//   page_index is start from 1
// }
cover.getActivities(paginationInfo: PaginationInfo): Promise<ActivityPagination>;
cover.getMyActivities(paginationInfo: PaginationInfo): Promise<MyActivityPagination>;
```

- Get **_Cover Metadata_** information

```typescript
// from Cover's instance
cover.coverMetadata(canisterId: Principal): Promise<CoverMetadata>;

// without Cover's instance
Cover.anonymousCoverMetadata(canisterId: Principal): Promise<CoverMetadata>;
```

- Interact with **_Cover Validator_**, more info about the validator and the parameters used below, see [here](https://github.com/Psychedelic/cover-validator)
- Cover SDK will get public key and signature from your identity and send to Cover Validator

```typescript
// save a build config
cover.saveBuildConfig(buildConfigRequest: BuildConfigRequest): Promise<void>;

// build a config
cover.build(buildRequest: BuildRequest): Promise<void>;

// build a saved config
cover.buildWithConfig(buildWithConfigRequest: BuildWithConfigRequest): Promise<void>;

// save a build config without create a Cover instance
Cover.anonymousSaveBuildConfig(buildConfigRequest: AnonymousBuildConfigRequest, coverConfig?: CoverConfig): Promise<void>;

// build a config without create a Cover instance
Cover.anonymousBuild(buildRequest: AnonymousBuildRequest, coverConfig?: CoverConfig): Promise<void>;

// build a saved config without create a Cover instance
Cover.anonymousBuildWithConfig(buildWithConfigRequest: AnonymousBuildWithConfigRequest, coverConfig?: CoverConfig): Promise<void>;

// build with metadata
Cover.buildWithCoverMetadata(coverMetadataRequest: CoverMetadataRequest, coverConfig?: CoverConfig): Promise<void>;
```

- Get public key and sign a signature with your identity and current timestamp

```typescript
// get public key
getPublicKey: (identity: SignIdentity) => string;

// sign a signature, return a hex string
sign: (identity: SignIdentity, timestamp: number) => Promise<string>;
```

- Error code with **_Validator's APIs_** above

```typescript
// error codes from the validator side(wrong format, missing arguments, internal error,...)
ERR_XXX;

// error codes from the sdk side(can't connect to the Validator, ...)
SDK_ERR_XXX;

// the error object will include these fields
{
  code: string;
  message: string;
  details: unknown;
}
```

### Typescript Example

Example extract identity from PEM using [SDK](https://github.com/Psychedelic/dfx-key/blob/main/cover-sdk.js)

```typescript
import {Cover, getPublicKey, sign} from '@psychedelic/cover';
import {Ed25519KeyIdentity} from '@dfinity/identity';
import {Principal} from '@dfinity/principal';
import {SignIdentity} from '@dfinity/agent';

// create new identity
const identity = Ed25519KeyIdentity.generate() as SignIdentity;

const cover = new Cover(identity);

// verify a canister
const isVerified = await cover.verify(Principal.fromText('iftvq-niaaa-aaaai-qasga-cai'));

// get wasm hash from IC network
const icHash = await cover.getICHash(Principal.fromText('iftvq-niaaa-aaaai-qasga-cai'));

// get wasm hash from Cover verification
const coverHash = await cover.getCoverHash(Principal.fromText('iftvq-niaaa-aaaai-qasga-cai'));

// get Cover verification by canister ID
const verification = await cover.getVerificationByCanisterId(Principal.fromText('iftvq-niaaa-aaaai-qasga-cai'));

// get public key
const publicKey = getPublicKey(identity);

// sign a signature
const timestamp = new Date().getTime();
const signature = await sign(identity, timestamp);
```
