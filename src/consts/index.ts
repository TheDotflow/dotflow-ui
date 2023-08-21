export type RELAY_CHAIN_OPTION = 'polkadot' | 'kusama';
const RELAY_CHAIN_ENDPOINTS = {
  polkadot: "wss://polkadot.api.onfinality.io/public-ws",
  kusama: "wss://kusama.api.onfinality.io/public-ws"
};
export const RELAY_CHAIN = (process.env.RELAY_CHAIN || 'polkadot') as RELAY_CHAIN_OPTION;
export const RELAY_CHAIN_ENDPOINT = RELAY_CHAIN_ENDPOINTS[RELAY_CHAIN];