export type RELAY_CHAIN_OPTION = 'polkadot' | 'kusama';
const RELAY_CHAIN_ENDPOINTS = {
  polkadot: "wss://rpc.polkadot.io",
  kusama: "wss://kusama-rpc.polkadot.io"
};
export const RELAY_CHAIN = (process.env.RELAY_CHAIN || 'polkadot') as RELAY_CHAIN_OPTION;
export const RELAY_CHAIN_ENDPOINT = RELAY_CHAIN_ENDPOINTS[RELAY_CHAIN];
export const ZERO = BigInt(0);

export const getRelayChainApiURL = (relay: "polkadot" | "kusama"): string => {
  return RELAY_CHAIN_ENDPOINTS[relay];
}

// NOTE: we do not need to store the name of these chains, but they are convenient
// for us while reading to code to see which chains support local XCM execution.
export const chainsSupportingXcmExecute = [
  {
    relayChain: "kusama",
    paraId: 0
  },
  {
    relayChain: "kusama",
    name: "crab",
    paraId: 2105
  },
  {
    relayChain: "kusama",
    name: "quartz by unique",
    paraId: 2095
  },
  {
    relayChain: "polkadot",
    name: "darwinia",
    paraId: 2046
  },
  {
    relayChain: "polkadot",
    name: "unique network",
    paraId: 2037
  }
];
