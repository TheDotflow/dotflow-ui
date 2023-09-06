import { ApiPromise } from "@polkadot/api";
import { Signer } from "@polkadot/api/types";
import { KeyringPair } from "@polkadot/keyring/types";

import SubstrateAssets from "./assets";
import SubstrateNative from "./native";
import SubstrateOrml from "./orml";
import SubstrateTokens from "./tokens";
import { AccountIdRaw } from "../xcmTransfer/types";

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
        await SubstrateNative.transfer(api, sender, token, to, amount, signer);
        break;
      case "substrate-assets":
        await SubstrateAssets.transfer(api, sender, token, to, amount, signer);
        break;
      case "substrate-tokens":
        await SubstrateTokens.transfer(api, sender, token, to, amount, signer);
        break;
      case "substrate-orml":
        await SubstrateOrml.transfer(api, sender, token, to, amount, signer);
        break;
    }
  }
}

export default NativeTransfer;
