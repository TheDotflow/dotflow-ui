import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { Signer } from "@polkadot/types/types";

import { Fungible, Receiver } from "./types";
import { AccountType } from "../../../types/types-arguments/identity";

class TransferAsset {
  public static async send(
    api: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible,
    signer?: Signer,
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

    const xcmPallet = api.tx.xcmPallet || api.tx.polkadotXcm;

    if (!xcmPallet) {
      throw new Error("The blockchain does not support XCM");
    };

    const xcmExecute = xcmPallet.execute(xcm, {
      refTime: Math.pow(10, 9),
      proofSize: 10000,
    });

    if (signer) api.setSigner(signer);

    const account = signer ? sender.address : sender;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const unsub = await xcmExecute.signAndSend(account, (result: any) => {
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
