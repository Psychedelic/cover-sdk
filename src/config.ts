interface Config {
  coverCanisterId: string;
  icHost: string;
  validatorUrl: string;
}

const coverCanisterId = "iftvq-niaaa-aaaai-qasga-cai";

const icHost = "https://ic0.app";

const validatorUrl = "https://h969vfa2pa.execute-api.us-east-1.amazonaws.com/production";

const config: Config = {coverCanisterId, icHost, validatorUrl};

export {config};
