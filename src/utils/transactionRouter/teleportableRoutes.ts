// File containing all the possible assets on all possible routes that support asset
// teleportation.

import AssetRegistry from "../assetRegistry";

export type TeleportableRoute = {
  relayChain: string,
  originParaId: number,
  destParaId: number,
  multiAsset: any
};

export const teleportableRoutes: TeleportableRoute[] = [
  {
    relayChain: "polkadot",
    originParaId: 0,
    destParaId: 1000,
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"polkadot"},"here"]'),
      false,
    ),
  },
  {
    relayChain: "kusama",
    originParaId: 0,
    destParaId: 1000,
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"kusama"},"here"]'),
      false,
    ),
  },
  {
    relayChain: "rococo",
    originParaId: 0,
    destParaId: 1000,
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"rocooc"},"here"]'),
      false,
    ),
  },
];
