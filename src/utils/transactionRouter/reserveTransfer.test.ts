// File containging unit tests for the `ReserveTransfer` class.
//
// The e2e tests are placed in the `__tests__` directory in the root of the project.

import { Keyring } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

import ReserveTransfer from "./reserveTransfer";
import { Fungible, Receiver } from "./types";
import { AccountType } from "../../../types/types-arguments/identity";
import { getDestination, getMultiAsset, getTransferBeneficiary } from ".";

const sr25519Keyring = new Keyring({ type: "sr25519" });
const ecdsaKeyring = new Keyring({ type: "ecdsa" });

describe("TransactionRouter unit tests", () => {
  describe("getDestination works", () => {
    it("Works with the destination being the relay chain", () => {
      expect(getDestination(true, 69, false)).toStrictEqual({
        V2: {
          parents: 1,
          interior: "Here",
        },
      });

      expect(getDestination(false, 69, false)).toStrictEqual({
        V2: {
          parents: 0,
          interior: "Here",
        },
      });
    });

    it("Works with the destination being a parachain", () => {
      expect(getDestination(false, 2000, true)).toStrictEqual({
        V2: {
          parents: 0,
          interior: {
            X1: { Parachain: 2000 },
          },
        },
      });

      expect(getDestination(true, 2000, true)).toStrictEqual({
        V2: {
          parents: 1,
          interior: {
            X1: { Parachain: 2000 },
          },
        },
      });
    });
  });

  describe("getTransferBeneficiary works", () => {
    it("Works with AccountId32", async () => {
      await cryptoWaitReady();

      const alice = sr25519Keyring.addFromUri("//Alice");
      const bob = ecdsaKeyring.addFromUri("//Bob");

      const receiverAccId32: Receiver = {
        addressRaw: alice.addressRaw,
        network: 0,
        type: AccountType.accountId32,
      };

      expect(
        getTransferBeneficiary(receiverAccId32),
      ).toStrictEqual({
        V2: {
          parents: 0,
          interior: {
            X1: {
              AccountId32: {
                network: "Any",
                id: receiverAccId32.addressRaw,
              },
            },
          },
        },
      });

      const receiverAccKey20: Receiver = {
        addressRaw: bob.addressRaw,
        network: 0,
        type: AccountType.accountKey20,
      };

      expect(
        getTransferBeneficiary(receiverAccKey20),
      ).toStrictEqual({
        V2: {
          parents: 0,
          interior: {
            X1: {
              AccountKey20: {
                network: "Any",
                id: receiverAccKey20.addressRaw,
              },
            },
          },
        },
      });
    });
  });

  describe("getMultiAsset works", () => {
    it("Should work", () => {
      const asset: Fungible = {
        multiAsset: {
          interior: "Here",
          parents: 0,
        },
        amount: 200,
      };

      expect(getMultiAsset(asset)).toStrictEqual({
        V2: [
          {
            fun: {
              Fungible: asset.amount,
            },
            id: {
              Concrete: asset.multiAsset,
            },
          },
        ],
      });
    });

    describe("withdrawAsset works", () => {
      it("Works with parachain origin", () => {
        const asset: Fungible = {
          multiAsset: {
            interior: {
              X3: [
                { Parachain: 2000 },
                { PalletInstance: 42 },
                { GeneralIndex: 69 },
              ],
            },
            parents: 0,
          },
          amount: 200,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.withdrawAsset(asset, true)).toStrictEqual({
          WithdrawAsset: [{
            id: {
              Concrete: {
                interior: {
                  X3: [
                    { Parachain: 2000 },
                    { PalletInstance: 42 },
                    { GeneralIndex: 69 },
                  ],
                },
                parents: 1
              }
            },
            fun: {
              Fungible: 200
            }
          }]
        });
      });

      it("Works with relaychain origin", () => {
        const complexAsset: Fungible = {
          multiAsset: {
            interior: {
              X2: [
                { PalletInstance: 42 },
                { GeneralIndex: 69 },
              ],
            },
            parents: 0,
          },
          amount: 200,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.withdrawAsset(complexAsset, false)).toStrictEqual({
          WithdrawAsset: [{
            id: {
              Concrete: {
                interior: {
                  X2: [
                    { PalletInstance: 42 },
                    { GeneralIndex: 69 },
                  ],
                },
                parents: 0
              }
            },
            fun: {
              Fungible: 200
            }
          }]
        });

        // Works with asset which has "Here" as interior.
        const simpleAsset: Fungible = {
          multiAsset: {
            interior: "Here",
            parents: 0
          },
          amount: 200,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.withdrawAsset(simpleAsset, false)).toStrictEqual({
          WithdrawAsset: [{
            id: {
              Concrete: {
                interior: "Here",
                parents: 0
              }
            },
            fun: {
              Fungible: 200
            }
          }]
        });
      });
    });

    describe("buyExecution works", () => {
      it("Works", () => {
        // Works with asset which has "Here" as interior.
        const asset: Fungible = {
          multiAsset: {
            interior: "Here",
            parents: 0
          },
          amount: 200,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.buyExecution(asset.multiAsset, 500)).toStrictEqual({
          BuyExecution: {
            fees: {
              id: {
                Concrete: {
                  interior: "Here",
                  parents: 0
                }
              },
              fun: {
                Fungible: 500
              }
            },
            weightLimit: "Unlimited"
          }
        })
      });
    });

    describe("depositReserveAsset works", () => {
      it("Works", () => {
        // Works with asset which has "Here" as interior.
        const asset: Fungible = {
          multiAsset: {
            interior: "Here",
            parents: 0
          },
          amount: 200,
        };


        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.depositReserveAsset(asset, 1, {
          parents: 1,
          interior: {
            X1: {
              Parachain: 2000
            }
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        }, [])).toStrictEqual({
          DepositReserveAsset: {
            assets: asset,
            maxAssets: 1,
            dest: {
              parents: 1,
              interior: {
                X1: {
                  Parachain: 2000
                }
              }
            },
            xcm: []
          }
        });
      });
    });

    describe("depositAsset & getReceiverAccount work", () => {
      it("Works with AccountId32", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const receiver: Receiver = {
          addressRaw: bob.addressRaw,
          type: AccountType.accountId32,
          network: 0,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.depositAsset({ Wild: "All" }, 1, receiver)).toStrictEqual({
          DepositAsset: {
            assets: { Wild: "All" },
            maxAssets: 1,
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
        });
      });

      it("Works with AccountKey20", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const receiver: Receiver = {
          addressRaw: bob.addressRaw,
          type: AccountType.accountKey20,
          network: 0,
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.depositAsset({ Wild: "All" }, 1, receiver)).toStrictEqual({
          DepositAsset: {
            assets: { Wild: "All" },
            maxAssets: 1,
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
        });
      });
    });

    describe("getReserve works", () => {
      it("works with origin para", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.getReserve(1000, true)).toStrictEqual({
          parents: 1,
          interior: {
            X1: {
              Parachain: 1000
            }
          }
        });
      });

      it("works with origin being the relaychain", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.getReserve(1000, false)).toStrictEqual({
          parents: 0,
          interior: {
            X1: {
              Parachain: 1000
            }
          }
        });
      });

      it("works with origin para and reserve relay", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.getReserve(-1, true)).toStrictEqual({
          parents: 1,
          interior: "Here"
        });
      });
    });

    describe("assetFromReservePerspective works", () => {
      it("Works with any number of junctions and 'Here'", () => {
        const junctions = {
          interior: {
            X5: [
              { Parachain: 1000 },
              { GeneralIndex: 42 },
              { GeneralIndex: 42 },
              { GeneralIndex: 42 },
              { GeneralIndex: 42 },
              // Doesn't matter what is in here for testing...
            ]
          },
          parents: 0
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ReserveTransfer.assetFromReservePerspective(junctions);
        expect(junctions).toStrictEqual({
          interior: {
            X4: [
              { GeneralIndex: 42 },
              { GeneralIndex: 42 },
              { GeneralIndex: 42 },
              { GeneralIndex: 42 },
            ]
          },
          parents: 0
        });

        const junctions2 = {
          interior: {
            X1: [
              { Parachain: 1000 },
              // Doesn't matter what is in here for testing this
            ]
          },
          parents: 1
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ReserveTransfer.assetFromReservePerspective(junctions2);
        expect(junctions2).toStrictEqual({
          interior: "Here",
          parents: 0
        });
      });
    });

    describe("extractJunctions works", () => {
      it("Works with any number of junctions and 'Here'", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.extractJunctions({
          interior: {
            X3: [
              // Doesn't matter what is in here for testing this
              { GeneralIndex: 42 },
              { Parachain: 42 },
              { GeneralIndex: 42 },
            ]
          },
          parents: 1
        })).toStrictEqual([
          { GeneralIndex: 42 },
          { Parachain: 42 },
          { GeneralIndex: 42 },
        ]);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(ReserveTransfer.extractJunctions({
          interior: "Here",
          parents: 1
        })).toStrictEqual("Here");
      });
    });

    describe("getSendToReserveChainInstructions works", () => {
      it("Works from parachain to parachain", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const destParaId = 2002;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32,
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X3: [
                { Parachain: destParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 },
              ],
            },
            parents: 0,
          },
          amount: 200,
        };

        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ReserveTransfer.getSendToReserveChainInstructions(
            asset,
            destParaId,
            beneficiary,
            true,
          ),
        ).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [
                {
                  fun: {
                    Fungible: 200,
                  },
                  id: {
                    Concrete: {
                      interior: {
                        X3: [
                          { Parachain: destParaId },
                          { PalletInstance: 42 },
                          { GeneralIndex: 69 },
                        ],
                      },
                      parents: 1,
                    },
                  },
                },
              ],
            },
            {
              InitiateReserveWithdraw: {
                assets: {
                  Wild: "All",
                },
                reserve: {
                  interior: {
                    X1: {
                      Parachain: destParaId,
                    },
                  },
                  parents: 1,
                },
                xcm: [
                  {
                    BuyExecution: {
                      fees: {
                        fun: {
                          Fungible: 450000000000,
                        },
                        id: {
                          Concrete: {
                            interior: {
                              X2: [
                                { PalletInstance: 42 },
                                { GeneralIndex: 69 },
                              ],
                            },
                            parents: 0,
                          },
                        },
                      },
                      weightLimit: "Unlimited",
                    },
                  },
                  {
                    DepositAsset: {
                      assets: {
                        Wild: "All",
                      },
                      beneficiary: {
                        interior: {
                          X1: {
                            AccountId32: {
                              id: bob.addressRaw,
                              network: "Any",
                            },
                          },
                        },
                        parents: 0,
                      },
                      maxAssets: 1,
                    },
                  },
                ],
              },
            },
          ],
        });
      });

      it("Works from parachain to relaychain", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const destParaId = 0;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32,
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X2: [{ PalletInstance: 42 }, { GeneralIndex: 69 }],
            },
            parents: 0,
          },
          amount: 200,
        };

        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ReserveTransfer.getSendToReserveChainInstructions(
            asset,
            destParaId,
            beneficiary,
            true,
          ),
        ).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [
                {
                  fun: {
                    Fungible: 200,
                  },
                  id: {
                    Concrete: {
                      interior: {
                        X2: [
                          { PalletInstance: 42 },
                          { GeneralIndex: 69 },
                        ],
                      },
                      parents: 1,
                    },
                  },
                },
              ],
            },
            {
              InitiateReserveWithdraw: {
                assets: {
                  Wild: "All",
                },
                reserve: {
                  interior: "Here",
                  parents: 1,
                },
                xcm: [
                  {
                    BuyExecution: {
                      fees: {
                        fun: {
                          Fungible: 450000000000,
                        },
                        id: {
                          Concrete: {
                            interior: {
                              X2: [
                                { PalletInstance: 42 },
                                { GeneralIndex: 69 },
                              ],
                            },
                            parents: 0,
                          },
                        },
                      },
                      weightLimit: "Unlimited",
                    },
                  },
                  {
                    DepositAsset: {
                      assets: {
                        Wild: "All",
                      },
                      beneficiary: {
                        interior: {
                          X1: {
                            AccountId32: {
                              id: bob.addressRaw,
                              network: "Any",
                            },
                          },
                        },
                        parents: 0,
                      },
                      maxAssets: 1,
                    },
                  },
                ],
              },
            },
          ],
        });
      });

      it("Works from relaychain to parachain", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const destParaId = 1000;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32,
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X2: [
                { Parachain: destParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 },
              ],
            },
            parents: 0,
          },
          amount: 200,
        };

        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ReserveTransfer.getSendToReserveChainInstructions(
            asset,
            destParaId,
            beneficiary,
            false,
          ),
        ).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [
                {
                  fun: {
                    Fungible: 200,
                  },
                  id: {
                    Concrete: {
                      interior: {
                        X3: [
                          { Parachain: destParaId },
                          { PalletInstance: 42 },
                          { GeneralIndex: 69 },
                        ],
                      },
                      parents: 0,
                    },
                  },
                },
              ],
            },
            {
              InitiateReserveWithdraw: {
                assets: {
                  Wild: "All",
                },
                reserve: {
                  interior: { X1: { Parachain: destParaId } },
                  parents: 0,
                },
                xcm: [
                  {
                    BuyExecution: {
                      fees: {
                        fun: {
                          Fungible: 450000000000,
                        },
                        id: {
                          Concrete: {
                            interior: {
                              X2: [
                                { PalletInstance: 42 },
                                { GeneralIndex: 69 },
                              ],
                            },
                            parents: 0,
                          },
                        },
                      },
                      weightLimit: "Unlimited",
                    },
                  },
                  {
                    DepositAsset: {
                      assets: {
                        Wild: "All",
                      },
                      beneficiary: {
                        interior: {
                          X1: {
                            AccountId32: {
                              id: bob.addressRaw,
                              network: "Any",
                            },
                          },
                        },
                        parents: 0,
                      },
                      maxAssets: 1,
                    },
                  },
                ],
              },
            },
          ],
        });
      });
    });

    describe("getTwoHopTransferInstructions works", () => {
      it("Works with parachain reserve", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const reserveParaId = 2000;
        const destParaId = 2002;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32,
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X3: [
                { Parachain: reserveParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 },
              ],
            },
            parents: 0,
          },
          amount: 200,
        };

        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ReserveTransfer.getTwoHopTransferInstructions(
            asset,
            reserveParaId,
            destParaId,
            beneficiary,
            true,
          ),
        ).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [
                {
                  id: {
                    Concrete: {
                      interior: {
                        X3: [
                          { Parachain: reserveParaId },
                          { PalletInstance: 42 },
                          { GeneralIndex: 69 },
                        ],
                      },
                      parents: 1,
                    },
                  },
                  fun: {
                    Fungible: asset.amount,
                  },
                },
              ],
            },
            {
              InitiateReserveWithdraw: {
                assets: {
                  Wild: "All",
                },
                reserve: {
                  interior: {
                    X1: {
                      Parachain: reserveParaId,
                    },
                  },
                  parents: 1,
                },
                xcm: [
                  {
                    BuyExecution: {
                      fees: {
                        fun: {
                          Fungible: 450000000000,
                        },
                        id: {
                          Concrete: {
                            interior: {
                              X2: [
                                { PalletInstance: 42 },
                                { GeneralIndex: 69 },
                              ],
                            },
                            parents: 0,
                          },
                        },
                      },
                      weightLimit: "Unlimited",
                    },
                  },
                  {
                    DepositReserveAsset: {
                      assets: {
                        Wild: "All",
                      },
                      dest: {
                        interior: {
                          X1: {
                            Parachain: destParaId,
                          },
                        },
                        parents: 1,
                      },
                      maxAssets: 1,
                      xcm: [
                        {
                          DepositAsset: {
                            assets: {
                              Wild: "All",
                            },
                            beneficiary: {
                              interior: {
                                X1: {
                                  AccountId32: {
                                    id: bob.addressRaw,
                                    network: "Any",
                                  },
                                },
                              },
                              parents: 0,
                            },
                            maxAssets: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        });
      });

      it("Works with relaychain being the reserve chain", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const reserveParaId = 0;
        const destParaId = 2002;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32,
        };

        const asset: Fungible = {
          multiAsset: {
            interior: "Here",
            parents: 0,
          },
          amount: 200,
        };

        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ReserveTransfer.getTwoHopTransferInstructions(
            asset,
            reserveParaId,
            destParaId,
            beneficiary,
            true,
          ),
        ).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [
                {
                  fun: {
                    Fungible: 200,
                  },
                  id: {
                    Concrete: {
                      interior: "Here",
                      parents: 1,
                    },
                  },
                },
              ],
            },
            {
              InitiateReserveWithdraw: {
                assets: {
                  Wild: "All",
                },
                reserve: {
                  interior: "Here",
                  parents: 1,
                },
                xcm: [
                  {
                    BuyExecution: {
                      fees: {
                        fun: {
                          Fungible: 450000000000,
                        },
                        id: {
                          Concrete: {
                            interior: "Here",
                            parents: 0,
                          },
                        },
                      },
                      weightLimit: "Unlimited",
                    },
                  },
                  {
                    DepositReserveAsset: {
                      assets: {
                        Wild: "All",
                      },
                      dest: {
                        interior: {
                          X1: {
                            Parachain: destParaId,
                          },
                        },
                        parents: 1,
                      },
                      maxAssets: 1,
                      xcm: [
                        {
                          DepositAsset: {
                            assets: {
                              Wild: "All",
                            },
                            beneficiary: {
                              interior: {
                                X1: {
                                  AccountId32: {
                                    id: bob.addressRaw,
                                    network: "Any",
                                  },
                                },
                              },
                              parents: 0,
                            },
                            maxAssets: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        });
      });

      test("Sending from relaychain to a parachain through a reserve parachain", () => {
        const bob = ecdsaKeyring.addFromUri("//Bob");

        const reserveParaId = 1000;
        const destParaId = 2000;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32,
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X3: [
                { Parachain: reserveParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 },
              ],
            },
            parents: 0,
          },
          amount: 200,
        };

        expect(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ReserveTransfer.getTwoHopTransferInstructions(
            asset,
            reserveParaId,
            destParaId,
            beneficiary,
            false,
          ),
        ).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [
                {
                  fun: {
                    Fungible: 200,
                  },
                  id: {
                    Concrete: {
                      interior: {
                        X3: [
                          { Parachain: reserveParaId },
                          { PalletInstance: 42 },
                          { GeneralIndex: 69 },
                        ],
                      },
                      parents: 0,
                    },
                  },
                },
              ],
            },
            {
              InitiateReserveWithdraw: {
                assets: {
                  Wild: "All",
                },
                reserve: {
                  interior: {
                    X1: {
                      Parachain: reserveParaId,
                    },
                  },
                  parents: 0,
                },
                xcm: [
                  {
                    BuyExecution: {
                      fees: {
                        fun: {
                          Fungible: 450000000000,
                        },
                        id: {
                          Concrete: {
                            interior: {
                              X2: [
                                { PalletInstance: 42 },
                                { GeneralIndex: 69 },
                              ],
                            },
                            parents: 0,
                          },
                        },
                      },
                      weightLimit: "Unlimited",
                    },
                  },
                  {
                    DepositReserveAsset: {
                      assets: {
                        Wild: "All",
                      },
                      dest: {
                        interior: {
                          X1: {
                            Parachain: 2000,
                          },
                        },
                        parents: 1,
                      },
                      maxAssets: 1,
                      xcm: [
                        {
                          DepositAsset: {
                            assets: {
                              Wild: "All",
                            },
                            beneficiary: {
                              interior: {
                                X1: {
                                  AccountId32: {
                                    id: bob.addressRaw,
                                    network: "Any",
                                  },
                                },
                              },
                              parents: 0,
                            },
                            maxAssets: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        });
      });
    });
  });
});
