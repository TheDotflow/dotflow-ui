import axios from 'axios';

type Asset = {
  asset: any,
  name: string,
  symbol: string,
  decimals: number,
  xcmInteriorKey?: string,
  inferred: boolean,
  confidence: number
};

const xcmGAR = "https://cdn.jsdelivr.net/gh/colorfulnotion/xcm-global-registry/metadata/xcmgar_url.json";

class AssetRegistry {
  public static async getAssetsOnBlockchain(chain: string): Promise<Asset[]> {
    const blockchains = (await axios.get(xcmGAR)).data;

    const blockchain = blockchains.find((b:any) => b.id == chain);
    if(!blockchain) {
      throw new Error("Blockchain not found");
    }

    const assetsUrl = blockchain.url;

    const assets: Asset[] = (await axios.get(assetsUrl)).data;

    return assets;
  }
}

export default AssetRegistry;
