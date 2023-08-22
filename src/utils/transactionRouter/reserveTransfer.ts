import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { FeePayment, Fungible, Receiver } from "./types";
import { getParaId } from "..";
import { AccountType } from "../../../types/types-arguments/identity";

class ReserveTransfer {
  // Transfers assets from the sender to the receiver.
  // 
  // This function assumes that the sender chain is the reserve chain of the asset.
  public static async sendFromReserveChain(
    originApi: ApiPromise,
    destinationApi: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible,
    feePayment: FeePayment
  ): Promise<void> {
    this.ensureContainsXcmPallet(originApi);
    this.ensureContainsXcmPallet(destinationApi);

    const destParaId = await getParaId(destinationApi);

    // eslint-disable-next-line no-prototype-builtins
    const isOriginPara = originApi.query.hasOwnProperty("parachainInfo");

    const destination = this.getDestination(isOriginPara, destParaId, destParaId >= 0);
    const beneficiary = this.getReserveTransferBeneficiary(receiver);
    const multiAsset = this.getMultiAsset(asset);

    const feeAssetItem = 0;
    const weightLimit = "Unlimited";

    const xcmPallet = (originApi.tx.xcmPallet || originApi.tx.polkadotXcm);

    const reserveTransfer = xcmPallet.limitedReserveTransferAssets(
      destination,
      beneficiary,
      multiAsset,
      feeAssetItem,
      weightLimit
    );

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
    asset: Fungible,
    feePayment: FeePayment
  ): Promise<void> {
    this.ensureContainsXcmPallet(originApi);
    this.ensureContainsXcmPallet(destinationApi);

    const destinationParaId = await getParaId(destinationApi);

    // eslint-disable-next-line no-prototype-builtins
    const isOriginPara = originApi.query.hasOwnProperty("parachainInfo");
    const xcmProgram = this.getSendToReserveChainInstructions(asset, destinationParaId, receiver, isOriginPara, feePayment);

    const xcmPallet = originApi.tx.xcmPallet || originApi.tx.polkadotXcm;

    const reserveTransfer = xcmPallet.execute(xcmProgram, {
      refTime: 3 * Math.pow(10, 11),
      proofSize: Math.pow(10, 6),
    });

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
    asset: Fungible,
    feePayment: FeePayment
  ): Promise<void> {
    this.ensureContainsXcmPallet(originApi);
    this.ensureContainsXcmPallet(destinationApi);
    this.ensureContainsXcmPallet(reserveChainApi);

    const reserveParaId = await getParaId(reserveChainApi);
    const destinationParaId = await getParaId(destinationApi);

    // eslint-disable-next-line no-prototype-builtins
    const isOriginPara = originApi.query.hasOwnProperty("parachainInfo");
    const xcmProgram = this.getTwoHopTransferInstructions(
      asset,
      reserveParaId,
      destinationParaId,
      receiver,
      isOriginPara,
      feePayment
    );

    const xcmPallet = originApi.tx.xcmPallet || originApi.tx.polkadotXcm;

    const reserveTransfer = xcmPallet.execute(xcmProgram, {
      refTime: 3 * Math.pow(10, 11),
      proofSize: Math.pow(10, 6),
    });
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

  // Returns the xcm instruction for transferring an asset accross its reserve chain.
  //
  // This xcm program executes the following instructions:
  //   1. `WithdrawAsset`, withdraw the amount the user wants to transfer from the sending chain
  //      and put it into the holding register
  //   2. `InitiateReserveWithdraw`, this will take all the assets in the holding register and burn 
  //      them on the origin chain. This will put the appropriate amount into the holding register on 
  //      the reserve chain.
  //   3. `BuyExecution`, on the reserve chain
  //   4. `DepositReserveAsset`, deposit into the parachain sovereign account. This will also notify the
  //      destination chain that it received the tokens.
  //   5. `DepositAsset`, this deposits the received assets on the destination chain into the receiver's
  //      account.
  private static getTwoHopTransferInstructions(
    asset: Fungible,
    reserveParaId: number,
    destParaId: number,
    beneficiary: Receiver,
    isOriginPara: boolean,
    feePayment: FeePayment
  ): any {
    const reserve = this.getReserve(reserveParaId, isOriginPara);

    const feeAsset = this.getFeePaymentAsset(feePayment, asset, isOriginPara, reserveParaId);

    return {
      V2: [
        this.withdrawAsset(asset, isOriginPara),
        {
          InitiateReserveWithdraw: {
            assets: {
              Wild: "All"
            },
            reserve,
            xcm: [
              // TODO: the hardcoded number isn't really accurate to what we actually need.
              this.buyExecution(feeAsset, 4500000000000),
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

  // Returns the XCM instruction for transfering an asset where the destination is the reserve chain of the asset.
  //
  // This xcm program executes the following instructions:
  //   1. `WithdrawAsset`, withdraw the amount the user wants to transfer from the sending chain
  //      and put it into the holding register
  //   2. `InitiateReserveWithdraw`, this will take all the assets in the holding register and burn 
  //      them on the origin chain. This will put the appropriate amount into the holding register on 
  //      the reserve chain.
  //   3. `BuyExecution`, on the reserve chain
  //   4. `DepositAsset`, this deposits the received assets to the receiver on the reserve chain.
  private static getSendToReserveChainInstructions(
    asset: Fungible,
    destParaId: number,
    beneficiary: Receiver,
    isOriginPara: boolean,
    feePayment: FeePayment
  ): any {
    const reserve = this.getReserve(destParaId, isOriginPara);

    const feeAsset = this.getFeePaymentAsset(feePayment, asset, isOriginPara, destParaId);

    return {
      V2: [
        this.withdrawAsset(asset, isOriginPara),
        {
          InitiateReserveWithdraw: {
            assets: {
              Wild: "All"
            },
            reserve,
            xcm: [
              // TODO: the hardcoded number isn't really accurate to what we actually need.
              this.buyExecution(feeAsset, 450000000000),
              this.depositAsset({ Wild: "All" }, 1, beneficiary)
            ]
          }
        },
      ]
    }
  }

  private static withdrawAsset(asset: Fungible, isOriginPara: boolean): any {
    const junctions = this.extractJunctions(asset.multiAsset);
    const parents = isOriginPara ? 1 : 0;

    const interior = junctions == "Here" ? "Here" : { [`X${junctions.length}`]: junctions };

    return {
      WithdrawAsset: [
        {
          id:
          {
            Concrete: {
              interior,
              parents
            },
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

  private static getReserve(reserveParaId: number, isOriginPara: boolean) {
    const parents = isOriginPara ? 1 : 0;

    if (reserveParaId < 0) {
      return {
        parents,
        interior: "Here"
      }
    } else {
      return {
        parents,
        interior: {
          X1: {
            Parachain: reserveParaId
          }
        }
      }
    }
  }

  // Returns the destination of an xcm reserve transfer.
  //
  // The destination is an entity that will process the xcm message(i.e a relaychain or a parachain). 
  private static getDestination(isOriginPara: boolean, destParaId: number, isDestPara: boolean): any {
    const parents = isOriginPara ? 1 : 0;

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
  private static getReserveTransferBeneficiary(receiver: Receiver) {
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

  private static ensureContainsXcmPallet(api: ApiPromise) {
    if (!(api.tx.xcmPallet || api.tx.polkadotXcm)) {
      throw new Error("The blockchain does not support XCM");
    }
  }

  // Helper function to remove a specific key from an object.
  private static assetFromReservePerspective(location: any) {
    const junctions = this.extractJunctions(location);

    if (junctions.length === 1) {
      location.interior = "Here";
      location.parents = 0;
      return;
    }

    junctions.splice(0, 1);
    delete location.interior[`X${junctions.length + 1}`];
    location.interior[`X${junctions.length}`] = junctions;
    location.parents = 0;
  }

  private static getFeePaymentAsset(feePayment: FeePayment, asset: Fungible, isOriginPara: boolean, reserveParaId: number): any {
    if (feePayment == FeePayment.RelayChainNative) {
      if (isOriginPara) {
        return {
          parents: 1,
          interior: "Here"
        };
      } else {
        return {
          parents: 0,
          interior: "Here"
        }
      }
    } else if (feePayment == FeePayment.Asset) {
      // NOTE: we use parse and stringify to make a hard copy of the asset.
      const assetFromReservePerspective = JSON.parse(JSON.stringify(asset.multiAsset));
      if (reserveParaId > 0) {
        // The location of the asset will always start with the parachain if the reserve is a parachain.
        this.assetFromReservePerspective(assetFromReservePerspective);
      } else {
        // The reserve is the relay chain.
        assetFromReservePerspective.parents = 0;
      }

      return assetFromReservePerspective;
    }
  }

  private static extractJunctions(location: any): any {
    const keyPattern = /^X\d$/;

    if (location.interior == "Here") {
      return "Here";
    }

    const key = Object.keys(location.interior).find(key => keyPattern.test(key));

    if (key) {
      return location.interior[key];
    } else {
      throw Error("Couldn't get junctions of an asset's location");
    }
  }
}

export default ReserveTransfer;
