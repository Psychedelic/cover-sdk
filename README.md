# Cover SDK

- Cover SDK is JavaScript and TypeScript library to work with Cover canister

### Contents Table

- [Installation](#installation)
- [Import](#import)
- [API](#api)
- [Example](#typescript-example)

### Installation

- Install from npm

```bash
npm i cover-sdk
```

### Import

- For CommonJS

```javascript
const {Cover} = require("cover-sdk");
```

- For JavaScript Modules

```javascript
import {Cover} from "cover-sdk";
```

### API

- Construct a new Cover object with your identity

```javascript
const cover = new Cover(IDENTITY);
```

- Verify a canister

```javascript
cover.verify(CANISTER_PRINCIPAL_ID);
```

- Get wasm hash

```javascript
//wasm hash in Cover verification
cover.getCoverHash(CANISTER_PRINCIPAL_ID);

//wasm hash on IC network
cover.getICHash(CANISTER_PRINCIPAL_ID);
```

- Get Cover verification

```javascript
//provide a pagination info to get all verifications
//items_per_page has Min value = 10 & Max = 120
//page_index is start from 1
cover.getAllVerifications({page_index, items_per_page});

//get verification by canister id
cover.getVerificationByCanisterId(CANISTER_PRINCIPAL_ID);

//get verification statistics
cover.getVerificationStats();
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

- Interact with build configs of given identity (the identity passed in the Cover constructor).

```javascript
//get all build configs
cover.getBuildConfigs();

//get build config by canister id
cover.getBuildConfigById(CANISTER_PRINCIPAL_ID);

//delete a build config
cover.deleteBuildConfig(CANISTER_PRINCIPAL_ID);
```

- Get recent activities from Cover

```javascript
//provide a pagination info to get activities
//items_per_page has Min value = 10 & Max = 120
//page_index is start from 1
cover.getActivities({page_index, items_per_page});
```

- Interact with **_Cover Validator_**, more info about the validator and the parameters used below, see [here](https://github.com/Psychedelic/cover-validator)
- Cover SDK will get public key and signature from your identity and send to Cover Validator

```javascript
//save a build config
cover.saveBuildConfig({
  owner_id,
  canister_id,
  canister_name,
  repo_url,
  commit_hash,
  dfx_version,
  rust_version,
  optimize_count,
  repo_access_token
});

//build a config
cover.build({
  owner_id,
  canister_id,
  canister_name,
  repo_url,
  commit_hash,
  dfx_version,
  rust_version,
  optimize_count,
  repo_access_token
});

//build a saved config
cover.buildWithConfig(CANISTER_ID, REPO_ACCESS_TOKEN, OWNER_ID);
```

- Error code with **_Validator's APIs_** above

```typescript
//error codes from the validator side(wrong format, missing arguments, internal error,...)
ERR_XXX;

//error codes from the sdk side(can't connect to the Validator, ...)
SDK_ERR_XXX;

//the error object will include these fields
{
  code: string;
  message: string;
  details: unknown;
}
```

### Typescript Example

```typescript
import {Cover} from "cover-sdk";
import {Ed25519KeyIdentity} from "@dfinity/identity";
import {Principal} from "@dfinity/principal";

//create new identity
const identity = Ed25519KeyIdentity.generate();

const cover = new Cover(identity);

//verify a canister
cover.verify(Principal.fromText("iftvq-niaaa-aaaai-qasga-cai")).then(console.log);

//get wasm hash from IC network
cover.getICHash(Principal.fromText("iftvq-niaaa-aaaai-qasga-cai")).then(console.log);

//get wasm hash from Cover verification
cover.getCoverHash(Principal.fromText("iftvq-niaaa-aaaai-qasga-cai")).then(console.log);

//get Cover verification by canister ID
cover.getVerificationByCanisterId(Principal.fromText("iftvq-niaaa-aaaai-qasga-cai")).then(console.log);
```
