// File containging unit tests for the `TransferAsset` class.
//
// The e2e tests are placed in the `__tests__` directory in the root of the project.

import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import TransferAsset from "./transferAsset";
import { Fungible } from "./types";
import { AccountType } from "../../../types/types-arguments/identity";

const sr25519Keyring = new Keyring({ type: "sr25519" });
const ecdsaKeyring = new Keyring({ type: "ecdsa" });

describe("TransferAsset unit tests", () => {
  it("Works with AccountId32 beneficiary", async () => {
    await cryptoWaitReady();

    const receiver = sr25519Keyring.addFromUri("//Alice");

    const asset: Fungible = {
      multiAsset: {
        parents: 0,
        interior: {
          X2: [
            { PalletInstance: 50 },
            { GeneralIndex: 1984 }
          ]
        }
      },
      amount: 1000
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(TransferAsset.xcmTransferAssetMessage(receiver.addressRaw, AccountType.accountId32, asset)).toStrictEqual({
      V2: [
        {
          TransferAsset: {
            assets: [
              {
                fun: {
                  Fungible: 1000
                },
                id: {
                  Concrete: {
                    parents: 0,
                    interior: {
                      X2: [
                        { PalletInstance: 50 },
                        { GeneralIndex: 1984 }
                      ]
                    }
                  }
                }
              }
            ],
            beneficiary: {
              interior: {
                X1: {
                  AccountId32: {
                    id: receiver.addressRaw,
                    network: "Any"
                  }
                }
              },
              parents: 0
            }
          }
        }
      ]
    });
  });

  it("Works with AccountKey20", async () => {
    await cryptoWaitReady();

    const receiver = ecdsaKeyring.addFromUri("//Alice");

    const asset: Fungible = {
      multiAsset: {
        parents: 0,
        interior: {
          X2: [
            { PalletInstance: 50 },
            { GeneralIndex: 1984 }
          ]
        }
      },
      amount: 1000
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(TransferAsset.xcmTransferAssetMessage(receiver.addressRaw, AccountType.accountKey20, asset)).toStrictEqual({
      V2: [
        {
          TransferAsset: {
            assets: [
              {
                fun: {
                  Fungible: 1000
                },
                id: {
                  Concrete: {
                    parents: 0,
                    interior: {
                      X2: [
                        { PalletInstance: 50 },
                        { GeneralIndex: 1984 }
                      ]
                    }
                  }
                }
              }
            ],
            beneficiary: {
              interior: {
                X1: {
                  AccountKey20: {
                    id: receiver.addressRaw,
                    network: "Any"
                  }
                }
              },
              parents: 0
            }
          }
        }
      ]
    });
  })
});
