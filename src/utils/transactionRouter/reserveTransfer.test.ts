// File containging unit tests for the `ReserveTransfer` class.
//
// The e2e tests are placed in the `__tests__` directory in the root of the project.

import { AccountType } from "../../../types/types-arguments/identity";
import ReserveTransfer from "./reserveTransfer";
import { Receiver, Fungible } from "./types";
import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from '@polkadot/util-crypto';

const sr25519Keyring = new Keyring({ type: "sr25519" });
const ecdsaKering = new Keyring({ type: "ecdsa" });

describe("TransactionRouter unit tests", () => {
  describe("getDestination works", () => {
    it("Works with the destination being the relay chain", () => {
      // @ts-ignore
      expect(ReserveTransfer.getDestination(true, 69, false)).toStrictEqual(
        {
          V1: {
            parents: 1,
            interior: "Here"
          }
        }
      );

      // @ts-ignore
      expect(ReserveTransfer.getDestination(false, 69, false)).toStrictEqual(
        {
          V1: {
            parents: 0,
            interior: "Here"
          }
        }
      );
    });

    it("Works with the destination being a parachain", () => {
      // @ts-ignore
      expect(ReserveTransfer.getDestination(false, 2000, true)).toStrictEqual(
        {
          V1: {
            parents: 0,
            interior: {
              X1: { Parachain: 2000 }
            }
          }
        }
      );

      // @ts-ignore
      expect(ReserveTransfer.getDestination(true, 2000, true)).toStrictEqual(
        {
          V1: {
            parents: 1,
            interior: {
              X1: { Parachain: 2000 }
            }
          }
        }
      );
    });
  });

  describe("getBeneficiary works", () => {
    it("Works with AccountId32", async () => {
      await cryptoWaitReady();

      const alice = sr25519Keyring.addFromUri("//Alice");
      const bob = ecdsaKering.addFromUri("//Bob");

      var receiver: Receiver = {
        addressRaw: alice.addressRaw,
        network: 0,
        type: AccountType.accountId32
      };

      // @ts-ignore
      expect(ReserveTransfer.getBeneficiary(receiver)).toStrictEqual(
        {
          V1: {
            parents: 0,
            interior: {
              X1: {
                AccountId32: {
                  network: "Any",
                  id: receiver.addressRaw
                }
              }
            }
          }
        }
      );

      var receiver: Receiver = {
        addressRaw: bob.addressRaw,
        network: 0,
        type: AccountType.accountKey20
      };

      // @ts-ignore
      expect(ReserveTransfer.getBeneficiary(receiver)).toStrictEqual(
        {
          V1: {
            parents: 0,
            interior: {
              X1: {
                AccountKey20: {
                  network: "Any",
                  id: receiver.addressRaw
                }
              }
            }
          }
        }
      );
    });
  });

  describe("getMultiAsset works", () => {
    it("Should work", () => {
      const asset: Fungible = {
        multiAsset: {
          interior: "Here",
          parents: 0,
        },
        amount: 200
      };

      // @ts-ignore
      expect(ReserveTransfer.getMultiAsset(asset)).toStrictEqual(
        {
          V1: {
            fun: {
              Fungible: asset.amount
            },
            id: {
              Concrete: asset.multiAsset
            }
          }
        }
      )
    });
  });
});