// File containing all the possible assets on all possible routes that support asset
// teleportation.

export type TeleportableRoute = {
  relayChain: string,
  originParaId: number,
  destParaId: number,
  xcAsset: string
};

export const teleportableRoutes: TeleportableRoute[] = [
  {
    relayChain: "polkadot",
    originParaId: 0,
    destParaId: 1000,
    xcAsset: "[{\"network\":\"polkadot\"},\"here\"]"
  },
  {
    relayChain: "kusama",
    originParaId: 0,
    destParaId: 1000,
    xcAsset: "[{\"network\":\"kusama\"},\"here\"]"
  },
  {
    relayChain: "rococo",
    originParaId: 0,
    destParaId: 1000,
    xcAsset: "[{\"network\":\"kusama\"},\"here\"]"
  }
];
