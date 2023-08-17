import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { Fungible, Receiver } from "./types";
import { AccountType } from "../../../types/types-arguments/identity";

class ReserveTransfer {
  // Transfers assets from the sender to the receiver.
  // 
  // This function assumes that the chain from which the sending is ocurring is the reserve chain of the asset.
  public static async sendFromReserveChain(
    originApi: ApiPromise,
    destinationApi: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    if (!(destinationApi.tx.xcmPallet || destinationApi.tx.polkadotXcm)) {
      throw new Error("The destination blockchain does not support XCM");
    }

    let destParaId = -1;
    if (destinationApi.query.parachainInfo) {
      const response = (await destinationApi.query.parachainInfo.parachainId()).toJSON();
      destParaId = Number(response);
    }

    const isOriginPara = originApi.query.hasOwnProperty("parachainInfo");

    const destination = this.getDestination(isOriginPara, destParaId, destParaId >= 0);
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

  // Transfers assets from the sender to the receiver.
  // 
  // This function assumes that the chain on which the receiver is receiving the tokens is the actual 
  // reserve chain of the asset.
  public static async sendToReserveChain(
    originApi: ApiPromise,
    destinationApi: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    // TODO
  }

  // Neither the sender nor the receiver chain is the reserve chain of the asset being sent.
  //
  // For this reason we are gonna need to transfer the asset across the reserve chain.
  public static async sendAcrossReserveChain(
    originApi: ApiPromise,
    destinationApi: ApiPromise,
    assetReserveChain: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    // TODO
  }

  // TODO: documentation
  private static twoHopXcmInstruction(): any {
    // TODO
  }

  // Returns the XCM instruction for transfering a reserve asset.
  private static transferReserveAssetInstruction(asset: Fungible, receiver: Receiver): any {
    return {
      TransferReserveAsset: {
        assets: this.getMultiAsset(asset),
        receiver: this.getBeneficiary(receiver)
      }
    }
  }

  // Returns the destination of an xcm reserve transfer.
  //
  // The destination is an entity that will process the xcm message(i.e a relaychain or a parachain). 
  private static getDestination(isOriginPara: boolean, destParaId: number, isDestPara: boolean): any {
    let parents = isOriginPara ? 1 : 0;

    if (isDestPara) {
      return {
        V2:
        {
          parents,
          interior: {
            X1: { Parachain: destParaId }
          }
        }
      }
    } else {
      // If the destination is not a parachain it is basically a relay chain.
      return {
        V2:
        {
          parents,
          interior: "Here"
        }
      }
    }
  }

  // Returns the beneficiary of an xcm reserve transfer.
  //
  // The beneficiary is an interior entity of the destination that will actually receive the tokens.
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
      V2: {
        parents: 0,
        interior: {
          X1: {
            ...receiverAccount
          }
        }
      }
    };
  }

  // Returns a proper MultiAsset.
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
