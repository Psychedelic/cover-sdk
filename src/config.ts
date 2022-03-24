interface Config {
  coverCanisterId: string;
  icHost: string;
  validatorUrl: string;
}

const coverCanisterId = "3x7en-uqaaa-aaaai-abgca-cai";

const icHost = "https://ic0.app";

const validatorUrl = "https://pxy2xvb1k3.execute-api.us-east-1.amazonaws.com/development";

const config: Config = {coverCanisterId, icHost, validatorUrl};

export {config};
