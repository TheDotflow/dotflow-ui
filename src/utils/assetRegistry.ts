import axios from 'axios';

type ChainId = number | string;

type RelayChain = 'polkadot' | 'kusama';

export type Asset = {
  asset: any;
  name: string;
  symbol: string;
  decimals: number;
  xcmInteriorKey?: any;
  type?: string;
  assetId?: any;
  onChainId?: any;
  inferred: boolean;
  confidence: number;
};

type MultiAsset = {
  parents: number;
  interior:
  | 'Here'
  | {
    [key: string]: Asset[];
  };
};

type ReserveChain = {
  parachainId: number;
  junctionIndex: number;
};

const xcmGAR =
  'https://cdn.jsdelivr.net/gh/colorfulnotion/xcm-global-registry/metadata/xcmgar_url.json';

class AssetRegistry {
  public static async getAssetsOnBlockchain(
    relay: RelayChain,
    chain: ChainId
  ): Promise<Asset[]> {
    const blockchains = (await axios.get(xcmGAR)).data;

    const blockchain = blockchains.assets[relay].find(
      (b: any) => (typeof chain === 'string') ? b.id.toLowerCase() == chain.toLowerCase() : b.paraID === chain
    );

    if (!blockchain) {
      throw new Error('Blockchain not found');
    }

    const assetsUrl = blockchain.url;

    const assets: Asset[] = (await axios.get(assetsUrl)).data;

    const xcAssets = assets.filter(asset => asset.xcmInteriorKey !== undefined);

    xcAssets.map((asset) => {
      asset.xcmInteriorKey = JSON.parse(asset.xcmInteriorKey);
    });

    return xcAssets;
  }

  public static xcmInteriorToMultiAsset(
    xcmInteriorKey: any[],
    isParachain: boolean,
    paraId?: number
  ): MultiAsset {
    // The first `junction` is actually just the specifying the chain and we
    // don't need that in `MultiAsset`.
    const junctionCount = xcmInteriorKey.length - 1;
    const { parachainId: assetParaId, junctionIndex } =
      this.getAssetReserveParachainId(xcmInteriorKey);

    if (assetParaId > 0 && assetParaId == paraId) {
      xcmInteriorKey.splice(junctionIndex, 1);
      const junctionCount = xcmInteriorKey.length - 1;

      if (this.isHere(xcmInteriorKey, junctionCount)) {
        return {
          parents: 0,
          interior: 'Here',
        };
      } else {
        const junctions = this.getJunctions(xcmInteriorKey, junctionCount);
        const x = `X${junctionCount}`;

        return {
          parents: 0,
          interior: {
            [x]: junctions,
          },
        };
      }
    }

    const parents = isParachain ? 1 : 0;

    if (this.isHere(xcmInteriorKey, junctionCount)) {
      return {
        parents,
        interior: 'Here',
      };
    }

    const junctions = this.getJunctions(xcmInteriorKey, junctionCount);
    const x = `X${junctionCount}`;

    return {
      parents,
      interior: {
        [x]: junctions,
      },
    };
  }

  private static getAssetReserveParachainId(
    xcmInteriorKey: any[]
  ): ReserveChain {
    // 0 will indicate that the reserve chain is actually the relay chain.
    let parachainId = 0;
    let index = -1;
    xcmInteriorKey.forEach((junction, i) => {
      if (junction.parachain) {
        parachainId = junction.parachain;
        index = i;
      }
    });

    return { parachainId, junctionIndex: index };
  }

  private static isHere(xcmInteriorKey: any[], junctionCount: number): boolean {
    return (
      junctionCount == 1 && xcmInteriorKey[1].toString().toLowerCase() == 'here'
    );
  }

  private static getJunctions(
    xcmInteriorKey: any[],
    junctionCount: number
  ): any[] {
    return xcmInteriorKey.slice(1, junctionCount + 1);
  }

  public static async assetsSupportedOnBothChains(
    relay: RelayChain,
    chainA: ChainId,
    chainB: ChainId,
  ): Promise<Asset[]> {
    const assetsOnChainA = await this.getAssetsOnBlockchain(relay, chainA);
    const assetsOnChainB = await this.getAssetsOnBlockchain(relay, chainB);

    const assetsOnBoth: Asset[] = [];
    for (let i = 0; i < assetsOnChainA.length; i++) {
      const asset: Asset = assetsOnChainA[i];

      if (!asset.xcmInteriorKey) {
        continue;
      }

      const isSupported = this.isSupported(asset.xcmInteriorKey, assetsOnChainB);

      if (isSupported) {
        assetsOnBoth.push(asset);
      }
    }

    return assetsOnBoth;
  }

  public static async isSupportedOnBothChains(
    relay: RelayChain,
    chainA: ChainId,
    chainB: ChainId,
    asset: any
  ): Promise<boolean> {
    const foundOnChainA = await this.isSupportedOnChain(relay, chainA, asset);
    const foundOnChainB = await this.isSupportedOnChain(relay, chainB, asset);

    return foundOnChainA && foundOnChainB;
  }

  public static async isSupportedOnChain(
    relay: RelayChain,
    chain: ChainId,
    xcAsset: any
  ): Promise<boolean> {
    const assets = await this.getAssetsOnBlockchain(relay, chain);

    return this.isSupported(xcAsset, assets);
  }

  private static isSupported(xcAsset: any, assets: Asset[]): boolean {
    const found = assets.find(
      (el: Asset) =>
        el.xcmInteriorKey &&
        JSON.stringify(el.xcmInteriorKey) === JSON.stringify(xcAsset)
    );

    if (found) return true;

    return false;
  }
}

export default AssetRegistry;
