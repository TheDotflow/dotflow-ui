import { ApiPromise } from "@polkadot/api";
import { Signer } from "@polkadot/api/types";
import { KeyringPair } from "@polkadot/keyring/types";

import { AccountIdRaw } from "../xcmTransfer/types";

class SubstrateOrml {
  public static async transfer(
    api: ApiPromise,
    sender: KeyringPair,
    token: any,
    to: AccountIdRaw,
    amount: number,
    signer?: Signer
  ): Promise<void> {
    if (token.type !== "substrate-orml")
      throw new Error(`This module doesn't handle tokens of type ${token.type}`)

    const currencyId = { Token: token.symbol.toUpperCase() }

    const transferCall = api.tx.tokens ?
      api.tx.tokens.transfer(to, currencyId, amount)
      :
      api.tx.currencies.transfer(to, currencyId, amount);

    if (signer) api.setSigner(signer);

    const account = signer ? sender.address : sender;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const unsub = await transferCall.signAndSend(account, (result: any) => {
          if (result.status.isFinalized) {
            unsub();
            if (result.dispatchError !== undefined) {
              reject(result.dispatchError)
            } else {
              resolve(result)
            }
          }
        })
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default SubstrateOrml;
