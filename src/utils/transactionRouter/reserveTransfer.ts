import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { Fungible, Receiver } from "./types";
import { AccountType } from "../../../types/types-arguments/identity";

class ReserveTransfer {
  public static async send(
    originApi: ApiPromise,
    destinationApi: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    if (!(destinationApi.tx.xcmPallet || destinationApi.tx.polkadotXcm)) {
      throw new Error("The destination blockchain does not support XCM");
    }

    let paraId = -1;
    if (destinationApi.query.parachainInfo) {
      paraId = Number((await destinationApi.query.parachainInfo.parachainId()).toHuman());
    }

    console.log("Reserve transferring");

    const destination = this.getDestination(paraId, paraId >= 0);
    const beneficiary = this.getBeneficiary(receiver);
    const multiAsset = this.getMultiAsset(asset);

    const feeAssetItem = 0;
    const weightLimit = "Unlimited";

    let reserveTransfer: any;
    if (originApi.tx.xcmPallet) {
      reserveTransfer = originApi.tx.xcmPallet.limitedReserveTransferAssets(
        destination,
        beneficiary,
        multiAsset,
        feeAssetItem,
        weightLimit
      );
    } else if (originApi.tx.polkadotXcm) {
      reserveTransfer = originApi.tx.polkadotXcm.limitedReserveTransferAssets(
        destination,
        beneficiary,
        multiAsset,
        feeAssetItem,
        weightLimit
      );
    } else {
      throw new Error("The blockchain does not support XCM");
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const unsub = await reserveTransfer.signAndSend(sender, (result: any) => {
        if (result.status.isFinalized) {
          unsub();
          resolve();
        }
      })
    });
  }

  private static getDestination(paraId: number, isPara: boolean): any {
    if (isPara) {
      return {
        V2: [
          {
            parents: 1,
            interior: {
              X1: [
                { Parachain: paraId },
              ]
            }
          }
        ]
      }
    } else {
      return {
        V2: [
          {
            parents: 1,
            interior: "Here"
          }
        ]
      }
    }
  }

  private static getBeneficiary(receiver: Receiver) {
    let receiverAccount;
    if (receiver.type == AccountType.accountId32) {
      receiverAccount = {
        AccountId32: {
          network: "Any",
          id: receiver.addressRaw,
        },
      };
    } else if (receiver.type == AccountType.accountKey20) {
      receiverAccount = {
        AccountKey20: {
          network: "Any",
          id: receiver.addressRaw,
        },
      };
    }

    return {
      V2: [
        receiverAccount
      ]
    };
  }

  private static getMultiAsset(asset: Fungible): any {
    return {
      V2: [
        {
          fun: {
            Fungible: asset.amount,
          },
          id: {
            Concrete: asset.multiAsset,
          },
        },
      ]
    }
  }
}

export default ReserveTransfer;
