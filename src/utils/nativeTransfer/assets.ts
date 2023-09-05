import { ApiPromise } from "@polkadot/api";
import { AccountIdRaw } from "../xcmTransfer/types";
import { Signer } from "@polkadot/api/types";
import { KeyringPair } from "@polkadot/keyring/types";

class SubstrateAssets {
  public static async transfer(
    api: ApiPromise,
    sender: KeyringPair,
    token: any,
    to: AccountIdRaw,
    amount: number,
    signer?: Signer
  ): Promise<void> {
    if (token.type !== "substrate-assets")
      throw new Error(`This module doesn't handle tokens of type ${token.type}`)

    const id = token.assetId

    const transferCall = api.tx.assets.transfer(id, { Id: to }, amount);

    if (signer) api.setSigner(signer);

    const account = signer ? sender.address : sender;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const unsub = await transferCall.signAndSend(account, (result: any) => {
        if (result.status.isFinalized) {
          unsub();
          resolve();
        }
      })
    });
  }
}

export default SubstrateAssets;
