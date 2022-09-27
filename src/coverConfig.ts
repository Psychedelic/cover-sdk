export interface EnvConfig {
  coverCanisterId: string;
  icHost: string;
  validatorUrl: string;
}

export const IC_HOST = 'https://ic0.app';

export const developmentConfig: EnvConfig = {
  coverCanisterId: '3x7en-uqaaa-aaaai-abgca-cai',
  icHost: IC_HOST,
  validatorUrl: 'https://pxy2xvb1k3.execute-api.us-east-1.amazonaws.com/development'
};

export const productionConfig: EnvConfig = {
  coverCanisterId: 'iftvq-niaaa-aaaai-qasga-cai',
  icHost: IC_HOST,
  validatorUrl: 'https://h969vfa2pa.execute-api.us-east-1.amazonaws.com/production'
};
