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
    this.ensureContainsXcmPallet(originApi);
    this.ensureContainsXcmPallet(destinationApi);

    const destParaId = await this.getParaId(destinationApi);

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
    this.ensureContainsXcmPallet(originApi);
    this.ensureContainsXcmPallet(destinationApi);

    const destinationParaId = await this.getParaId(destinationApi);

    const xcmProgram = this.transferReserveAssetInstruction(asset, destinationParaId, receiver);

    let reserveTransfer: any;
    if (originApi.tx.xcmPallet) {
      reserveTransfer = originApi.tx.xcmPallet.execute(xcmProgram, {
        refTime: 3 * Math.pow(10, 11),
        proofSize: Math.pow(10, 6),
      });
    } else if (originApi.tx.polkadotXcm) {
      reserveTransfer = originApi.tx.polkadotXcm.execute(xcmProgram, {
        refTime: 3 * Math.pow(10, 11),
        proofSize: Math.pow(10, 6),
      });
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

  // Neither the sender nor the receiver chain is the reserve chain of the asset being sent.
  //
  // For this reason we are gonna need to transfer the asset across the reserve chain.
  public static async sendAcrossReserveChain(
    originApi: ApiPromise,
    destinationApi: ApiPromise,
    reserveChainApi: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    this.ensureContainsXcmPallet(originApi);
    this.ensureContainsXcmPallet(destinationApi);
    this.ensureContainsXcmPallet(reserveChainApi);

    const reserveParaId = await this.getParaId(reserveChainApi);
    const destinationParaId = await this.getParaId(destinationApi);

    const xcmProgram = this.twoHopXcmInstruction(asset, reserveParaId, destinationParaId, receiver);

    let reserveTransfer: any;
    if (originApi.tx.xcmPallet) {
      reserveTransfer = originApi.tx.xcmPallet.execute(xcmProgram, {
        refTime: 3 * Math.pow(10, 11),
        proofSize: Math.pow(10, 6),
      });
    } else if (originApi.tx.polkadotXcm) {
      reserveTransfer = originApi.tx.polkadotXcm.execute(xcmProgram, {
        refTime: 3 * Math.pow(10, 11),
        proofSize: Math.pow(10, 6),
      });
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

  // TODO: documentation
  private static twoHopXcmInstruction(asset: Fungible, reserveParaId: number, destParaId: number, beneficiary: Receiver): any {
    const reserve = this.getReserve(reserveParaId);

    // NOTE: we use parse and stringify to make a hard copy of the asset.
    let assetFromReservePerspective = JSON.parse(JSON.stringify(asset.multiAsset));
    if (reserveParaId > 0) {
      // The location of the asset will always start with the parachain if the reserve is a parachain.
      this.removeParachainFromLocation(assetFromReservePerspective, reserveParaId);
    }

    return {
      V2: [
        this.withdrawAsset(asset),
        {
          InitiateReserveWithdraw: {
            assets: {
              Wild: "All"
            },
            reserve,
            xcm: [
              // TODO: the hardcoded number isn't really accurate to what we actually need.
              this.buyExecution(assetFromReservePerspective, 450000000000),
              this.depositReserveAsset({ Wild: "All" }, 1, {
                parents: 1,
                interior: {
                  X1: {
                    Parachain: destParaId
                  }
                }
              }, [
                this.depositAsset({ Wild: "All" }, 1, beneficiary)
              ])
            ]
          }
        },
      ]
    }
  }

  // Returns the XCM instruction for transfering a reserve asset.
  private static transferReserveAssetInstruction(asset: Fungible, destParaId: number, beneficiary: Receiver): any {
    const reserve = this.getReserve(destParaId);

    // NOTE: we use parse and stringify to make a hard copy of the asset.
    let assetFromReservePerspective = JSON.parse(JSON.stringify(asset.multiAsset));
    if (destParaId >= 0) {
      // The location of the asset will always start with the parachain if the reserve is a parachain.
      this.removeParachainFromLocation(assetFromReservePerspective, destParaId);
    }

    return {
      V2: [
        this.withdrawAsset(asset),
        {
          InitiateReserveWithdraw: {
            assets: {
              Wild: "All"
            },
            reserve,
            xcm: [
              // TODO: the hardcoded number isn't really accurate to what we actually need.
              this.buyExecution(assetFromReservePerspective, 450000000000),
              this.depositAsset({ Wild: "All" }, 1, this.getReceiverAccount(beneficiary))
            ]
          }
        },
      ]
    }
  }

  private static withdrawAsset(asset: Fungible): any {
    return {
      WithdrawAsset: [
        {
          id:
          {
            Concrete: asset.multiAsset
          },
          fun: {
            Fungible: asset.amount
          }
        }
      ]
    };
  }

  private static buyExecution(multiAsset: any, amount: number): any {
    return {
      BuyExecution: {
        fees: {
          id: {
            Concrete: multiAsset
          },
          fun: {
            Fungible: amount
          }
        },
        weightLimit: "Unlimited"
      },
    };
  }

  private static depositReserveAsset(assets: any, maxAssets: number, dest: any, xcm: any[]): any {
    return {
      DepositReserveAsset: {
        assets,
        maxAssets,
        dest,
        xcm
      }
    }
  }

  private static depositAsset(assets: any, maxAssets: number, receiver: Receiver): any {
    const beneficiary = {
      parents: 0,
      interior: {
        X1: this.getReceiverAccount(receiver)
      }
    };

    return {
      DepositAsset: {
        assets,
        maxAssets,
        beneficiary
      }
    };
  }

  private static getReserve(reserveParaId: number) {
    if (reserveParaId < 0) {
      return {
        parents: 0,
        interior: "Here"
      }
    } else {
      return {
        parents: 1,
        interior: {
          X1: {
            Parachain: reserveParaId
          }
        }
      }
    }
  }

  private static async getParaId(api: ApiPromise): Promise<number> {
    if (api.query.parachainInfo) {
      const response = (await api.query.parachainInfo.parachainId()).toJSON();
      return Number(response);
    } else {
      return -1;
    }
  }

  private static ensureContainsXcmPallet(api: ApiPromise) {
    if (!(api.tx.xcmPallet || api.tx.polkadotXcm)) {
      throw new Error("The blockchain does not support XCM");
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
    const receiverAccount = this.getReceiverAccount(receiver);

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

  private static getReceiverAccount(receiver: Receiver): any {
    if (receiver.type == AccountType.accountId32) {
      return {
        AccountId32: {
          network: "Any",
          id: receiver.addressRaw,
        },
      };
    } else if (receiver.type == AccountType.accountKey20) {
      return {
        AccountKey20: {
          network: "Any",
          id: receiver.addressRaw,
        },
      };
    }
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

  // Helper function to remove a specific key from an object.
  private static removeParachainFromLocation(location: any, paraId: number) {
    const keyPattern = /^X\d$/;

    const key = Object.keys(location.interior).find(key => keyPattern.test(key));

    if (key) {
      const junctions: any[] = location.interior[key];
      junctions.splice(0, 1);
      delete location.interior[key];
      location.interior[`X${junctions.length}`] = junctions;
      location.parents = 0;
    } else {
      throw Error("Couldn't get junctions of an asset's location");
    }
  }
}

export default ReserveTransfer;
