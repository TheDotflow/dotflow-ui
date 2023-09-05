import { ApiPromise } from "@polkadot/api";
import { AccountIdRaw } from "../xcmTransfer/types";
import SubstrateAssets from "./assets";
import { Signer } from "@polkadot/api/types";
import { KeyringPair } from "@polkadot/keyring/types";

class NativeTransfer {
  public static async transfer(
    api: ApiPromise,
    sender: KeyringPair,
    token: any,
    to: AccountIdRaw,
    amount: number,
    signer?: Signer
  ): Promise<void> {

    switch (token.type) {
      case "substrate-native":
        break;
      case "substrate-assets":
        await SubstrateAssets.transfer(api, sender, token, to, amount, signer);
        break;
      case "substrate-tokens":
        break;
      case "substrate-orml":
        break;
      case "evm-erc20":
        break;
      case "evm-native":
        break;
    }
  }
}

export default NativeTransfer;
