import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { AccountIdRaw } from "../xcmTransfer/types";
import { Signer } from "@polkadot/api/types";

class SubstrateNative {
  public static async transfer(
    api: ApiPromise,
    sender: KeyringPair,
    token: any,
    to: AccountIdRaw,
    amount: number,
    signer?: Signer
  ): Promise<void> {
    if (token.type !== "substrate-native")
      throw new Error(`This module doesn't handle tokens of type ${token.type}`)

    const transferCall = api.tx.balances.transfer(to, amount);

    if (signer) api.setSigner(signer);

    const account = signer ? sender.address : sender;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const unsub = await transferCall.signAndSend(account, (result: any) => {
        if (result.status.isFinalized) {
          unsub();
          resolve();
        }
      });
    });
  }
}

export default SubstrateNative;
