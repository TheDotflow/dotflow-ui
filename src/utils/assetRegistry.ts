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

    let blockchain;

    if(network == "polkadot") {
      blockchain = blockchains.assets.polkadot.find((b:any) => b.id.toLowerCase() == chain.toLowerCase());
    }else if(network == "kusama") {
      blockchain = blockchains.assets.kusama.find((b:any) => b.id.toLowerCase() == chain.toLowerCase());
    }

    if(!blockchain) {
      throw new Error("Blockchain not found");
    }

    const assetsUrl = blockchain.url;

    const assets: Asset[] = (await axios.get(assetsUrl)).data;
    assets.map((asset) => {
      if(asset.xcmInteriorKey) {
        asset.xcmInteriorKey = JSON.parse(asset.xcmInteriorKey);
      }
    });

    return assets;
  }
}

export default AssetRegistry;
