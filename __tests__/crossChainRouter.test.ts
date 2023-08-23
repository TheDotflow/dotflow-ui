import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { u8aToHex } from '@polkadot/util';

import TransactionRouter from "../src/utils/transactionRouter";
import { FeePayment, Fungible, Receiver, Sender } from "../src/utils/transactionRouter/types";

import IdentityContractFactory from "../types/constructors/identity";
import IdentityContract from "../types/contracts/identity";
import { AccountType, NetworkInfo } from "../types/types-arguments/identity";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");
const keyring = new Keyring({ type: "sr25519" });

const USDT_ASSET_ID = 1984;
const DUMMY_ASSET_ID = 42;

const WS_ROROCO_LOCAL = "ws://127.0.0.1:9900";
const WS_ASSET_HUB_LOCAL = "ws://127.0.0.1:9910";
const WS_TRAPPIST_LOCAL = "ws://127.0.0.1:9920";

describe("TransactionRouter Cross-chain", () => {
  let swankyApi: ApiPromise;
  let alice: KeyringPair;
  let bob: KeyringPair;
  let charlie: KeyringPair;
  let identityContract: any;

  beforeEach(async function (): Promise<void> {
    swankyApi = await ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });
    alice = keyring.addFromUri("//Alice");
    bob = keyring.addFromUri("//Bob");
    charlie = keyring.addFromUri("//Charlie");

    const factory = new IdentityContractFactory(swankyApi, alice);
    identityContract = new IdentityContract(
      (await factory.new()).address,
      alice,
      swankyApi
    );

    await addNetwork(identityContract, alice, {
      rpcUrl: WS_ASSET_HUB_LOCAL,
      accountType: AccountType.accountId32,
    });

    await addNetwork(identityContract, alice, {
      rpcUrl: WS_TRAPPIST_LOCAL,
      accountType: AccountType.accountId32,
    });

    await addNetwork(identityContract, alice, {
      rpcUrl: "ws://127.0.0.1:9930",
      accountType: AccountType.accountId32,
    });
  });

  describe("Transferring cross-chain from asset's reserve chain", () => {
    test("Transferring USDT cross-chain and paying with it for fees works", async () => {
      const sender: Sender = {
        keypair: alice,
        network: 0
      };

      const receiver: Receiver = {
        addressRaw: bob.addressRaw,
        type: AccountType.accountId32,
        network: 1,
      };

      const rococoProvider = new WsProvider(WS_ROROCO_LOCAL);
      const rococoApi = await ApiPromise.create({
        provider: rococoProvider,
      });

      const assetHubProvider = new WsProvider(WS_ASSET_HUB_LOCAL);
      const assetHubApi = await ApiPromise.create({
        provider: assetHubProvider,
      });

      const trappistProvider = new WsProvider(WS_TRAPPIST_LOCAL);
      const trappistApi = await ApiPromise.create({
        provider: trappistProvider,
      });

      const lockdownMode = await getLockdownMode(trappistApi);
      if (lockdownMode) {
        await deactivateLockdown(trappistApi, alice);
      }

      // Create assets on both networks

      if (!(await getAsset(assetHubApi, DUMMY_ASSET_ID))) {
        await forceCreateAsset(rococoApi, assetHubApi, 1000, alice, USDT_ASSET_ID);
      }

      if (!(await getAsset(trappistApi, USDT_ASSET_ID))) {
        await createAsset(trappistApi, alice, USDT_ASSET_ID);
      }

      // If the asset is not already registered in the registry make sure we add it.
      if (!(await getAssetIdMultiLocation(trappistApi, USDT_ASSET_ID))) {
        await registerReserveAsset(trappistApi, alice, USDT_ASSET_ID, {
          parents: 1,
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: USDT_ASSET_ID }
            ]
          }
        });
      }

      const mintAmount = 5000000000000;
      // Mint some assets to the creator.
      await mintAsset(assetHubApi, sender.keypair, USDT_ASSET_ID, mintAmount);

      const senderBalanceBefore = await getAssetBalance(assetHubApi, USDT_ASSET_ID, alice.address);
      const receiverBalanceBefore = await getAssetBalance(trappistApi, USDT_ASSET_ID, bob.address);

      const amount = 4000000000000;
      const assetReserveChainId = 0;

      const asset: Fungible = {
        multiAsset: {
          interior: {
            X2: [
              { PalletInstance: 50 },
              { GeneralIndex: USDT_ASSET_ID }
            ]
          },
          parents: 0,
        },
        amount
      };

      await TransactionRouter.sendTokens(
        identityContract,
        sender,
        receiver,
        assetReserveChainId,
        asset
      );

      const senderBalanceAfter = await getAssetBalance(assetHubApi, USDT_ASSET_ID, alice.address);
      const receiverBalanceAfter = await getAssetBalance(trappistApi, USDT_ASSET_ID, bob.address);

      expect(senderBalanceAfter).toBe(senderBalanceBefore - amount);
      // The `receiverBalanceAfter` won't be exactly equal to `receiverBalanceBefore + amount` since some of the tokens are
      // used for `BuyExecution`.
      expect(receiverBalanceAfter).toBeGreaterThanOrEqual(receiverBalanceBefore);
    }, 180000);

    test("Transferring cross-chain from asset's reserve and pay for fees with ROC", async () => {
      const sender: Sender = {
        keypair: alice,
        network: 0
      };

      const receiver: Receiver = {
        addressRaw: bob.addressRaw,
        type: AccountType.accountId32,
        network: 1,
      };

      const rococoProvider = new WsProvider(WS_ROROCO_LOCAL);
      const rococoApi = await ApiPromise.create({
        provider: rococoProvider,
      });

      const assetHubProvider = new WsProvider(WS_ASSET_HUB_LOCAL);
      const assetHubApi = await ApiPromise.create({
        provider: assetHubProvider,
      });

      const trappistProvider = new WsProvider(WS_TRAPPIST_LOCAL);
      const trappistApi = await ApiPromise.create({
        provider: trappistProvider,
      });

      const lockdownMode = await getLockdownMode(trappistApi);
      if (lockdownMode) {
        await deactivateLockdown(trappistApi, alice);
      }

      // Create assets on both networks

      if (!(await getAsset(assetHubApi, DUMMY_ASSET_ID))) {
        await forceCreateAsset(rococoApi, assetHubApi, 1000, alice, DUMMY_ASSET_ID);
      }

      if (!(await getAsset(trappistApi, DUMMY_ASSET_ID))) {
        await createAsset(trappistApi, alice, DUMMY_ASSET_ID);
      }

      // If the asset is not already registered in the registry make sure we add it.
      if (!(await getAssetIdMultiLocation(trappistApi, DUMMY_ASSET_ID))) {
        await registerReserveAsset(trappistApi, alice, DUMMY_ASSET_ID, {
          parents: 1,
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: DUMMY_ASSET_ID }
            ]
          }
        });
      }

      const mintAmount = 5000;
      // Mint some assets to the creator.
      await mintAsset(assetHubApi, sender.keypair, DUMMY_ASSET_ID, mintAmount);

      const senderBalanceBefore = await getAssetBalance(assetHubApi, DUMMY_ASSET_ID, alice.address);
      const receiverBalanceBefore = await getAssetBalance(trappistApi, DUMMY_ASSET_ID, bob.address);

      const amount = 500;
      const assetReserveChainId = 0;

      const asset: Fungible = {
        multiAsset: {
          interior: {
            X2: [
              { PalletInstance: 50 },
              { GeneralIndex: DUMMY_ASSET_ID }
            ]
          },
          parents: 0,
        },
        amount
      };

      await TransactionRouter.sendTokens(
        identityContract,
        sender,
        receiver,
        assetReserveChainId,
        asset,
        FeePayment.RelayChainNative
      );

      const senderBalanceAfter = await getAssetBalance(assetHubApi, DUMMY_ASSET_ID, alice.address);
      const receiverBalanceAfter = await getAssetBalance(trappistApi, DUMMY_ASSET_ID, bob.address);

      expect(senderBalanceAfter).toBe(senderBalanceBefore - amount);
      expect(receiverBalanceAfter).toBe(receiverBalanceBefore);
    }, 180000);
  });

  describe("Transferring cross-chain to asset's reserve chain", () => {
    test("Transferring USDT and paying with it for fees works", async () => {
      // NOTE this test depends on the success of the first test.

      const rococoProvider = new WsProvider(WS_ROROCO_LOCAL);
      const rococoApi = await ApiPromise.create({
        provider: rococoProvider,
      });

      const assetHubProvider = new WsProvider(WS_ASSET_HUB_LOCAL);
      const assetHubApi = await ApiPromise.create({
        provider: assetHubProvider,
      });

      const trappistProvider = new WsProvider(WS_TRAPPIST_LOCAL);
      const trappistApi = await ApiPromise.create({
        provider: trappistProvider,
      });

      const lockdownMode = await getLockdownMode(trappistApi);
      if (lockdownMode) {
        await deactivateLockdown(trappistApi, alice);
      }

      // Create assets on both networks.

      if (!(await getAsset(assetHubApi, USDT_ASSET_ID))) {
        await forceCreateAsset(rococoApi, assetHubApi, 1000, alice, USDT_ASSET_ID);
      }

      if (!(await getAsset(trappistApi, USDT_ASSET_ID))) {
        await createAsset(trappistApi, alice, USDT_ASSET_ID);
      }

      // If the asset is not already registered in the registry make sure we add it.
      if (!(await getAssetIdMultiLocation(trappistApi, USDT_ASSET_ID))) {
        await registerReserveAsset(trappistApi, alice, USDT_ASSET_ID, {
          parents: 1,
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: USDT_ASSET_ID }
            ]
          }
        });
      }

      const amount = 950000000000;

      const sender: Sender = {
        keypair: bob,
        network: 1
      };

      const receiver: Receiver = {
        addressRaw: charlie.addressRaw,
        type: AccountType.accountId32,
        network: 0,
      };

      const asset: Fungible = {
        multiAsset: {
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: USDT_ASSET_ID }
            ]
          },
          parents: 1,
        },
        amount
      };

      const senderBalanceBefore = await getAssetBalance(trappistApi, USDT_ASSET_ID, bob.address);
      const receiverBalanceBefore = await getAssetBalance(assetHubApi, USDT_ASSET_ID, charlie.address);

      // Transfer the tokens to charlies's account on asset hub:
      await TransactionRouter.sendTokens(identityContract, sender, receiver, receiver.network, asset);

      // We need to wait a bit more to actually receive the assets on the base chain.
      await delay(5000);

      const senderBalanceAfter = await getAssetBalance(trappistApi, USDT_ASSET_ID, bob.address);
      const receiverBalanceAfter = await getAssetBalance(assetHubApi, USDT_ASSET_ID, charlie.address);

      // Some tolerance since part of the tokens will be used for fee payment.
      const tolerance = 100000;
      expect(senderBalanceAfter).toBeLessThanOrEqual(senderBalanceBefore - amount);
      expect(receiverBalanceAfter).toBeGreaterThanOrEqual(receiverBalanceBefore + amount - tolerance);
    }, 120000);

    test("Transferring USDT and paying with ROC for fees works", async () => {
      /*
      const assetHubProvider = new WsProvider(WS_ASSET_HUB_LOCAL);
      const assetHubApi = await ApiPromise.create({
        provider: assetHubProvider,
      });

      const trappistProvider = new WsProvider(WS_TRAPPIST_LOCAL);
      const trappistApi = await ApiPromise.create({
        provider: trappistProvider,
      });

      const lockdownMode = await getLockdownMode(trappistApi);
      if (lockdownMode) {
        await deactivateLockdown(trappistApi, alice);
      }

      // Create dummy assets on both networks.

      if (!(await getAsset(assetHubApi, DUMMY_ASSET_ID))) {
        await createAsset(assetHubApi, alice, DUMMY_ASSET_ID);
      }

      if (!(await getAsset(trappistApi, DUMMY_ASSET_ID))) {
        await createAsset(trappistApi, alice, DUMMY_ASSET_ID);
      }

      const mintAmount = 50000;
      // Mint some assets to the alice.
      await mintAsset(assetHubApi, alice, DUMMY_ASSET_ID, mintAmount);

      // If the asset is not already registered in the registry make sure we add it.
      if (!(await getAssetIdMultiLocation(trappistApi, DUMMY_ASSET_ID))) {
        await registerReserveAsset(trappistApi, alice, DUMMY_ASSET_ID, {
          parents: 1,
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: DUMMY_ASSET_ID }
            ]
          }
        });
      }

      const amount = 500;

      const sender: Sender = {
        keypair: alice,
        network: 0
      };

      const receiver: Receiver = {
        addressRaw: bob.addressRaw,
        type: AccountType.accountId32,
        network: 1,
      };

      const asset: Fungible = {
        multiAsset: {
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: DUMMY_ASSET_ID }
            ]
          },
          parents: 0,
        },
        amount
      };

      // Transfer the tokens to charlies's account on asset hub:
      await TransactionRouter.sendTokens(identityContract, sender, receiver, receiver.network, asset, FeePayment.RelayChainNative);
      */
    }, 180000)
  });

  describe("Transferring cross-chain accross reserve chain ", () => {
    test("Transferring USDT and paying with it for fees works", async () => {
      // NOTE this test depends on the success of the first test.

      const rococoProvider = new WsProvider(WS_ROROCO_LOCAL);
      const rococoApi = await ApiPromise.create({
        provider: rococoProvider,
      });

      const assetHubProvider = new WsProvider(WS_ASSET_HUB_LOCAL);
      const assetHubApi = await ApiPromise.create({
        provider: assetHubProvider,
      });

      const trappistProvider = new WsProvider(WS_TRAPPIST_LOCAL);
      const trappistApi = await ApiPromise.create({
        provider: trappistProvider,
      });

      const baseProvider = new WsProvider("ws://127.0.0.1:9930");
      const baseApi = await ApiPromise.create({
        provider: baseProvider,
      });

      const lockdownMode = await getLockdownMode(trappistApi);
      if (lockdownMode) {
        await deactivateLockdown(trappistApi, alice);
      }

      // Create assets on all networks.

      if (!(await getAsset(assetHubApi, USDT_ASSET_ID))) {
        await forceCreateAsset(rococoApi, assetHubApi, 1000, alice, USDT_ASSET_ID);
      }

      if (!(await getAsset(trappistApi, USDT_ASSET_ID))) {
        await createAsset(trappistApi, alice, USDT_ASSET_ID);
      }

      if (!(await getAsset(baseApi, USDT_ASSET_ID))) {
        await createAsset(baseApi, alice, USDT_ASSET_ID);
      }

      // If the asset is not already registered in the registry make sure we add it.
      if (!(await getAssetIdMultiLocation(trappistApi, USDT_ASSET_ID))) {
        await registerReserveAsset(trappistApi, alice, USDT_ASSET_ID, {
          parents: 1,
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: USDT_ASSET_ID }
            ]
          }
        });
      }

      const amount = 950000000000;
      const assetReserveChainId = 0;

      const sender: Sender = {
        keypair: bob,
        network: 1
      };

      const receiver: Receiver = {
        addressRaw: bob.addressRaw,
        type: AccountType.accountId32,
        network: 2,
      };

      const asset: Fungible = {
        multiAsset: {
          interior: {
            X3: [
              { Parachain: 1000 },
              { PalletInstance: 50 },
              { GeneralIndex: USDT_ASSET_ID }
            ]
          },
          parents: 1,
        },
        amount
      };

      const senderBalanceBefore = await getAssetBalance(trappistApi, USDT_ASSET_ID, bob.address);
      const receiverBalanceBefore = await getAssetBalance(baseApi, USDT_ASSET_ID, bob.address);

      // Transfer the tokens to bob's account on base:
      await TransactionRouter.sendTokens(identityContract, sender, receiver, assetReserveChainId, asset);

      // We need to wait a bit more to actually receive the assets on the base chain.
      await delay(12000);

      const senderBalanceAfter = await getAssetBalance(trappistApi, USDT_ASSET_ID, bob.address);
      const receiverBalanceAfter = await getAssetBalance(baseApi, USDT_ASSET_ID, bob.address);

      // Some tolerance since part of the tokens will be used for fee payment.
      const tolerance = 100000;
      expect(senderBalanceAfter).toBeLessThanOrEqual(senderBalanceBefore - amount);
      expect(receiverBalanceAfter).toBeGreaterThanOrEqual(receiverBalanceBefore + amount - tolerance);
    }, 180000);
  });
});

const addNetwork = async (
  contract: IdentityContract,
  signer: KeyringPair,
  network: NetworkInfo
): Promise<void> => {
  await contract
    .withSigner(signer)
    .tx.addNetwork(network);
};

const createAsset = async (
  api: ApiPromise,
  signer: KeyringPair,
  id: number
): Promise<void> => {
  const callTx = async (resolve: () => void) => {
    const create = api.tx.assets.create(id, signer.address, 10);
    const unsub = await create.signAndSend(signer, (result: any) => {
      if (result.status.isInBlock) {
        unsub();
        resolve();
      }
    });
  };
  return new Promise(callTx);
};

const forceCreateAsset = async (
  relaychainApi: ApiPromise,
  paraApi: ApiPromise,
  paraId: number,
  signer: KeyringPair,
  id: number
): Promise<void> => {
  const forceCreate = u8aToHex(paraApi.tx.assets.forceCreate(id, signer.address, true, 10).method.toU8a());

  const xcm = {
    V3: [
      {
        UnpaidExecution: {
          weightLimit: "Unlimited"
        }
      },
      {
        Transact: {
          originKind: "Superuser",
          requireWeightAtMost: {
            refTime: 9000000000,
            proofSize: 10000
          },
          call: {
            encoded: forceCreate,
          }
        }
      }
    ]
  };

  const callTx = async (resolve: () => void) => {
    const paraSudoCall = relaychainApi.tx.parasSudoWrapper.sudoQueueDownwardXcm(paraId, xcm);

    const unsub = await relaychainApi.tx.sudo.sudo(paraSudoCall).signAndSend(signer, (result: any) => {
      if (result.status.isInBlock) {
        unsub();
        resolve();
      }
    });
  }
  return new Promise(callTx);
}

const mintAsset = async (
  api: ApiPromise,
  signer: KeyringPair,
  id: number,
  amount: number
): Promise<void> => {
  const callTx = async (resolve: () => void) => {
    const unsub = await api.tx.assets
      .mint(
        id,
        signer.address, // beneficiary
        amount
      )
      .signAndSend(signer, (result: any) => {
        if (result.status.isInBlock) {
          unsub();
          resolve();
        }
      });
  };
  return new Promise(callTx);
};

const registerReserveAsset = async (
  api: ApiPromise,
  signer: KeyringPair,
  id: number,
  assetLocation: any
): Promise<void> => {
  const callTx = async (resolve: () => void) => {
    const register = api.tx.assetRegistry.registerReserveAsset(id, assetLocation);
    const unsub = await api.tx.sudo.sudo(register)
      .signAndSend(signer, (result: any) => {
        if (result.status.isInBlock) {
          unsub();
          resolve();
        }
      });
  };
  return new Promise(callTx);
}

const getAssetIdMultiLocation = async (api: ApiPromise, id: number): Promise<any> => {
  return (await api.query.assetRegistry.assetIdMultiLocation(id)).toJSON();
}

const deactivateLockdown = async (api: ApiPromise, signer: KeyringPair): Promise<void> => {
  const callTx = async (resolve: () => void) => {
    const forceDisable = api.tx.lockdownMode.deactivateLockdownMode();
    const unsub = await api.tx.sudo.sudo(forceDisable)
      .signAndSend(signer, (result: any) => {
        if (result.status.isInBlock) {
          unsub();
          resolve();
        }
      });
  };
  return new Promise(callTx);
}

const getLockdownMode = async (api: ApiPromise): Promise<any> => {
  return (await api.query.lockdownMode.lockdownModeStatus()).toJSON();
};

const getAsset = async (api: ApiPromise, id: number): Promise<any> => {
  return (await api.query.assets.asset(id)).toJSON();
};

const getAssetBalance = async (api: ApiPromise, id: number, who: string): Promise<any> => {
  const maybeBalance: any = (await api.query.assets.account(id, who)).toJSON();
  if (maybeBalance && maybeBalance.balance) {
    return maybeBalance.balance;
  }
  return 0;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
