import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { Fungible, Receiver } from "./types";
import { AccountType } from "../../../types/types-arguments/identity";

class TransferAsset {
  public static async send(
    api: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    // We use XCM even for transfers that are occurring on the same chain. The reason for
    // this is that we cannot know what is the pallet and function for transferring tokens 
    // since it can be different on each chain. For that reason we will use the XCM `TransferAsset` 
    // instruction which is standardized and as far as the chain has an XCM executor the 
    // transaction will be executed correctly.

    const xcm = this.xcmTransferAssetMessage(
      receiver.addressRaw,
      receiver.type,
      asset.multiAsset,
      asset.amount
    );

    let xcmExecute: any;

    if (api.tx.xcmPallet) {
      // TODO: come up with more precise weight estimations.
      xcmExecute = api.tx.xcmPallet.execute(xcm, {
        refTime: Math.pow(10, 9),
        proofSize: 10000,
      });
    } else if (api.tx.polkadotXcm) {
      // TODO: come up with more precise weight estimations.
      xcmExecute = api.tx.polkadotXcm.execute(xcm, {
        refTime: Math.pow(10, 9),
        proofSize: 10000,
      });
    } else {
      throw new Error("The blockchain does not support XCM");
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const unsub = await xcmExecute.signAndSend(sender, (result: any) => {
        if (result.status.isFinalized) {
          unsub();
          resolve();
        }
      })
    });
  }

  // Constructs a `TransferAsset` XCM message that will be executed when sending
  // tokens on the same chain.
  private static xcmTransferAssetMessage(
    receiverAddress: Uint8Array,
    receiverAccountType: AccountType,
    multiAsset: any,
    amount: number
  ): any {
    let receiverAccount;
    if (receiverAccountType == AccountType.accountId32) {
      receiverAccount = {
        AccountId32: {
          network: "Any",
          id: receiverAddress,
        },
      };
    } else if (receiverAccountType == AccountType.accountKey20) {
      receiverAccount = {
        AccountKey20: {
          network: "Any",
          id: receiverAddress,
        },
      };
    }

    // TODO: should this have `BuyExecution`?
    const xcmMessage = {
      V2: [
        {
          TransferAsset: {
            assets: [
              {
                fun: {
                  Fungible: amount,
                },
                id: {
                  Concrete: multiAsset,
                },
              },
            ],
            beneficiary: {
              interior: {
                X1: receiverAccount,
              },
              parents: 0,
            },
          },
        },
      ],
    };
    return xcmMessage;
  }
}

export default TransferAsset;
