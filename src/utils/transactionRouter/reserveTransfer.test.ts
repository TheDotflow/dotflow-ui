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
          V2: {
            parents: 1,
            interior: "Here"
          }
        }
      );

      // @ts-ignore
      expect(ReserveTransfer.getDestination(false, 69, false)).toStrictEqual(
        {
          V2: {
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
          V2: {
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
          V2: {
            parents: 1,
            interior: {
              X1: { Parachain: 2000 }
            }
          }
        }
      );
    });
  });

  describe("getReserveTransferBeneficiary works", () => {
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
      expect(ReserveTransfer.getReserveTransferBeneficiary(receiver)).toStrictEqual(
        {
          V2: {
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
      expect(ReserveTransfer.getReserveTransferBeneficiary(receiver)).toStrictEqual(
        {
          V2: {
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
          V2: [
            {
              fun: {
                Fungible: asset.amount
              },
              id: {
                Concrete: asset.multiAsset
              }
            }
          ]
        }
      )
    });

    describe("getSendToReserveChainInstructions works", () => {
      it("Works from parachain to parachain", () => {
        const bob = ecdsaKering.addFromUri("//Bob");

        const destParaId = 2002;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X3: [
                { Parachain: destParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 }
              ]
            },
            parents: 0,
          },
          amount: 200
        };

        // @ts-ignore
        expect(ReserveTransfer.getSendToReserveChainInstructions(
          asset,
          destParaId,
          beneficiary,
          true
        )).toStrictEqual({
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
                          {
                            Parachain: destParaId,
                          },
                          {
                            PalletInstance: 42,
                          },
                          {
                            GeneralIndex: 69,
                          },
                        ],
                      },
                      parents: 1,
                    },
                  },
                },
              ]
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
                                {
                                  PalletInstance: 42,
                                },
                                {
                                  GeneralIndex: 69,
                                },
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
                              network: "Any"
                            }
                          }
                        },
                        parents: 0
                      },
                      maxAssets: 1
                    }
                  }
                ]
              }
            }
          ]
        });
      });

      it("Works from parachain to relaychain", () => {
        const bob = ecdsaKering.addFromUri("//Bob");

        const destParaId = -1;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X2: [
                { PalletInstance: 42 },
                { GeneralIndex: 69 }
              ]
            },
            parents: 0,
          },
          amount: 200
        };

        // @ts-ignore
        expect(ReserveTransfer.getSendToReserveChainInstructions(
          asset,
          destParaId,
          beneficiary,
          true
        )).toStrictEqual({
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
                          {
                            PalletInstance: 42,
                          },
                          {
                            GeneralIndex: 69,
                          },
                        ],
                      },
                      parents: 1,
                    },
                  },
                },
              ]
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
                                {
                                  PalletInstance: 42,
                                },
                                {
                                  GeneralIndex: 69,
                                },
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
                              network: "Any"
                            }
                          }
                        },
                        parents: 0
                      },
                      maxAssets: 1
                    }
                  }
                ]
              }
            }
          ]
        });
      });

      it("Works from relaychain to parachain", () => {
        const bob = ecdsaKering.addFromUri("//Bob");

        const destParaId = 1000;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X2: [
                { Parachain: destParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 }
              ]
            },
            parents: 0,
          },
          amount: 200
        };

        // @ts-ignore
        expect(ReserveTransfer.getSendToReserveChainInstructions(
          asset,
          destParaId,
          beneficiary,
          false
        )).toStrictEqual({
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
              ]
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
                                {
                                  PalletInstance: 42,
                                },
                                {
                                  GeneralIndex: 69,
                                },
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
                              network: "Any"
                            }
                          }
                        },
                        parents: 0
                      },
                      maxAssets: 1
                    }
                  }
                ]
              }
            }
          ]
        });
      });
    });

    describe("getTwoHopTransferInstructions works", () => {
      it("Works with parachain reserve", () => {
        const bob = ecdsaKering.addFromUri("//Bob");

        const reserveParaId = 2000;
        const destParaId = 2002;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X3: [
                { Parachain: reserveParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 }
              ]
            },
            parents: 0,
          },
          amount: 200
        };

        // @ts-ignore
        expect(ReserveTransfer.getTwoHopTransferInstructions(
          asset,
          reserveParaId,
          destParaId,
          beneficiary,
          true
        )).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [{
                id:
                {
                  Concrete: {
                    interior: {
                      X3: [
                        {
                          Parachain: reserveParaId,
                        },
                        {
                          PalletInstance: 42,
                        },
                        {
                          GeneralIndex: 69,
                        },
                      ],
                    },
                    parents: 1,
                  },
                },
                fun: {
                  Fungible: asset.amount
                }
              }]
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
                                {
                                  PalletInstance: 42,
                                },
                                {
                                  GeneralIndex: 69,
                                },
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
                                    network: "Any"
                                  }
                                }
                              },
                              parents: 0
                            },
                            maxAssets: 1
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
          ]
        });
      });

      it("Works with relaychain being the reserve chain", () => {
        const bob = ecdsaKering.addFromUri("//Bob");

        const reserveParaId = -1;
        const destParaId = 2002;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32
        };

        const asset: Fungible = {
          multiAsset: {
            interior: "Here",
            parents: 0,
          },
          amount: 200
        };

        // @ts-ignore
        expect(ReserveTransfer.getTwoHopTransferInstructions(
          asset,
          reserveParaId,
          destParaId,
          beneficiary,
          true
        )).toStrictEqual({
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
                    }
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
                                    network: "Any"
                                  }
                                }
                              },
                              parents: 0
                            },
                            maxAssets: 1
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        });
      });

      test("Sending from relaychain to a parachain through a reserve parachain", () => {
        const bob = ecdsaKering.addFromUri("//Bob");

        const reserveParaId = 1000;
        const destParaId = 2000;
        const beneficiary: Receiver = {
          addressRaw: bob.addressRaw,
          network: 1,
          type: AccountType.accountId32
        };

        const asset: Fungible = {
          multiAsset: {
            interior: {
              X3: [
                { Parachain: reserveParaId },
                { PalletInstance: 42 },
                { GeneralIndex: 69 }
              ]
            },
            parents: 0,
          },
          amount: 200
        };

        // @ts-ignore
        expect(ReserveTransfer.getTwoHopTransferInstructions(
          asset,
          reserveParaId,
          destParaId,
          beneficiary,
          false
        )).toStrictEqual({
          V2: [
            {
              WithdrawAsset: [{
                fun: {
                  Fungible: 200,
                },
                id: {
                  Concrete: {
                    interior: {
                      X3: [
                        {
                          Parachain: reserveParaId,
                        },
                        {
                          PalletInstance: 42,
                        },
                        {
                          GeneralIndex: 69,
                        },
                      ],
                    },
                    parents: 0,
                  },
                }
              }]
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
                                {
                                  PalletInstance: 42,
                                },
                                {
                                  GeneralIndex: 69,
                                },
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
                                    network: "Any"
                                  }
                                }
                              },
                              parents: 0
                            },
                            maxAssets: 1
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        });
      });
    });
  });
});
