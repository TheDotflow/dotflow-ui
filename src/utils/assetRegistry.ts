import axios from 'axios';

type Asset = {
  asset: any,
  name: string,
  symbol: string,
  decimals: number,
  xcmInteriorKey?: any,
  inferred: boolean,
  confidence: number
};

const xcmGAR = "https://cdn.jsdelivr.net/gh/colorfulnotion/xcm-global-registry/metadata/xcmgar_url.json";

class AssetRegistry {
  public static async getAssetsOnBlockchain(network: "polkadot" | "kusama", chain: string): Promise<Asset[]> {
    const blockchains = (await axios.get(xcmGAR)).data;

    const blockchain = blockchains.assets[network].find((b: any) => b.id.toLowerCase() == chain.toLowerCase());

    if (!blockchain) {
      throw new Error("Blockchain not found");
    }

    const assetsUrl = blockchain.url;

    const assets: Asset[] = (await axios.get(assetsUrl)).data;

    assets.map((asset) => {
      if (asset.xcmInteriorKey) {
        asset.xcmInteriorKey = JSON.parse(asset.xcmInteriorKey);
      }
    });

    return assets;
  }

  public static xcmInteriorToMultiAsset(xcmInteriorKey: any[], isParachain: boolean) {
    // The first 'junction' is actually just the specifying the network and we
    // don't need that in `MultiAsset`.
    const junctionCount = xcmInteriorKey.length - 1;
    const parents = isParachain? 1 : 0;

    if(junctionCount == 1 && xcmInteriorKey[1].toString().toLowerCase() == "here") {
      return {
        parents,
        interior: "Here" 
      }
    }

    const junctions = this.getJunctions(xcmInteriorKey, junctionCount);
    const x = `X${junctionCount}`;

    return {
      parents,
      interior: {
        [x]: junctions
      }
    }
  }

  private static getJunctions(xcmInteriorKey: any[], junctionCount: number): any[] {
    let junctions = [];
    for(let i = 1; i <= junctionCount; i++) {
      junctions.push(xcmInteriorKey[i]);
    }

    return junctions;
  } 
}

export default AssetRegistry;
