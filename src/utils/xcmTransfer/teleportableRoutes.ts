// File containing all the possible assets on all possible routes that support asset
// teleportation.

import AssetRegistry, { Asset } from "../assetRegistry";

export type TeleportableRoute = {
  relayChain: string,
  originParaId: number,
  destParaId: number,
  asset: Asset,
  multiAsset: any
};

export const teleportableRoutes: TeleportableRoute[] = [
  {
    relayChain: "polkadot",
    originParaId: 0,
    destParaId: 1000,
    asset: {
      asset: {
        Token: "DOT"
      },
      name: "DOT",
      symbol: "DOT",
      decimals: 10,
      xcmInteriorKey: '[{"network":"polkadot"},"here"]',
      inferred: true,
      confidence: 0
    },
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"polkadot"},"here"]'),
      false
    )
  },
  {
    relayChain: "polkadot",
    originParaId: 1000,
    destParaId: 0,
    asset: {
      asset: {
        Token: "DOT"
      },
      name: "DOT",
      symbol: "DOT",
      decimals: 10,
      xcmInteriorKey: '[{"network":"polkadot"},"here"]',
      inferred: true,
      confidence: 0
    },
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"polkadot"},"here"]'),
      false
    )
  },
  {
    relayChain: "kusama",
    originParaId: 0,
    destParaId: 1000,
    asset: {
      asset: {
        Token: "KSM"
      },
      name: "KSM",
      symbol: "KSM",
      decimals: 12,
      xcmInteriorKey: '[{"network":"kusama"},"here"]',
      inferred: true,
      confidence: 0
    },
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"kusama"},"here"]'),
      false
    )
  },
  {
    relayChain: "kusama",
    originParaId: 1000,
    destParaId: 0,
    asset: {
      asset: {
        Token: "KSM"
      },
      name: "KSM",
      symbol: "KSM",
      decimals: 12,
      xcmInteriorKey: '[{"network":"kusama"},"here"]',
      inferred: true,
      confidence: 0
    },
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"kusama"},"here"]'),
      false
    )
  },
  {
    relayChain: "rococo",
    originParaId: 0,
    destParaId: 1000,
    asset: {
      asset: {
        Token: "ROC"
      },
      name: "ROC",
      symbol: "ROC",
      decimals: 12,
      xcmInteriorKey: '[{"network":"rococo"},"here"]',
      inferred: true,
      confidence: 0
    },
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"rococo"},"here"]'),
      false
    )
  },
  {
    relayChain: "rococo",
    originParaId: 1000,
    destParaId: 0,
    asset: {
      asset: {
        Token: "ROC"
      },
      name: "ROC",
      symbol: "ROC",
      decimals: 12,
      xcmInteriorKey: '[{"network":"rococo"},"here"]',
      inferred: true,
      confidence: 0
    },
    multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
      JSON.parse('[{"network":"rococo"},"here"]'),
      false
    )
  }
];

export const getTeleportableAssets = (originChainId: number, destChainId: number, relay: "polkadot" | "kusama"): Asset[] => {
  const routes = teleportableRoutes.filter(
    (route) => route.originParaId === originChainId
      && route.destParaId === destChainId
      && route.relayChain === relay
  );

  return routes.map((route) => route.asset);
}
