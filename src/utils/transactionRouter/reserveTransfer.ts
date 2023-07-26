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

    let isPara = false;
    if (destinationApi.query.parachainSystem) {
      const chain = await destinationApi.rpc.system.chain();
      isPara = true;
    }

    const multiAsset = this.getMultiAsset(asset);
    if (originApi.tx.xcmPallet) {
      const reserveTransfer = originApi.tx.xcmPallet.reserveTransferAssets(

      )
    } else if (originApi.tx.polkadotXcm) {

    } else {
      throw new Error("The blockchain does not support XCM");
    }
  }

  private static getDestination(receiver: Receiver, paraId: number, isPara: boolean): any {
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

    if (isPara) {
      return {
        V2: [
          {
            parents: 1,
            interior: {
              X2: [
                { Parachain: paraId },
                receiverAccount
              ]
            }
          }
        ]
      }
    } else {

    }
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
