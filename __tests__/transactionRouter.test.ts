import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { Fungible, Receiver, Sender } from "@/utils/transactionRouter/types";

import TransactionRouter from "../src/utils/transactionRouter";
import IdentityContractFactory from "../types/constructors/identity";
import IdentityContract from "../types/contracts/identity";
import { AccountType, ChainInfo } from "../types/types-arguments/identity";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");
const keyring = new Keyring({ type: "sr25519" });

describe("TransactionRouter e2e tests", () => {
  let swankyApi: ApiPromise;
  let alice: KeyringPair;
  let bob: KeyringPair;
  let identityContract: any;

  beforeEach(async function (): Promise<void> {
    swankyApi = await ApiPromise.create({
      provider: wsProvider,
      noInitWarn: true,
    });
    alice = keyring.addFromUri("//Alice");
    bob = keyring.addFromUri("//Bob");

    const factory = new IdentityContractFactory(swankyApi, alice);
    identityContract = new IdentityContract(
      (await factory.new()).address,
      alice,
      swankyApi
    );
  });

  it("Can't send tokens to yourself", async () => {
    // First lets add a chain and create an identity.

    await addChain(identityContract, alice, 1836, {
      rpcUrls: ["ws://127.0.0.1:9910"],
      accountType: AccountType.accountId32,
    });

    const sender: Sender = {
      keypair: alice,
      chain: 1836
    };

    const receiver: Receiver = {
      addressRaw: alice.addressRaw,
      type: AccountType.accountId32,
      chain: 1836,
    };

    const asset: Fungible = {
      multiAsset: {},
      amount: 1000
    };

    const assetReserveChainId = 1836;

    const trappitProvider = new WsProvider("ws://127.0.0.1:9920");
    const trappistApi = await ApiPromise.create({
      provider: trappitProvider,
    });

    await expect(
      TransactionRouter.sendTokens(
        sender,
        receiver,
        assetReserveChainId,
        asset,
        {
          originApi: trappistApi,
          destApi: trappistApi
        }
      )
    ).rejects.toThrow("Cannot send tokens to yourself");
  }, 60000);

  it("Sending native asset on the same chain works", async () => {
    const sender: Sender = {
      keypair: alice,
      chain: 0
    };

    const receiver: Receiver = {
      addressRaw: bob.addressRaw,
      type: AccountType.accountId32,
      chain: 0,
    };

    const rococoProvider = new WsProvider("ws://127.0.0.1:9900");
    const rococoApi = await ApiPromise.create({ provider: rococoProvider });

    const { data: balance } = (await rococoApi.query.system.account(
      receiver.addressRaw
    )) as any;
    const receiverBalance = parseInt(balance.free.toHuman().replace(/,/g, ""));

    // First lets add a chain.
    await addChain(identityContract, alice, 0, {
      rpcUrls: ["ws://127.0.0.1:9900"],
      accountType: AccountType.accountId32,
    });

    const amount = Math.pow(10, 12);

    const asset: Fungible = {
      multiAsset: {
        interior: "Here",
        parents: 0,
      },
      amount
    };
    const assetReserveChainId = 0;

    await TransactionRouter.sendTokens(
      sender,
      receiver,
      assetReserveChainId,
      asset,
      {
        originApi: rococoApi,
        destApi: rococoApi
      }
    );

    const { data: newBalance } = (await rococoApi.query.system.account(
      receiver.addressRaw
    )) as any;
    const newReceiverBalance = parseInt(
      newBalance.free.toHuman().replace(/,/g, "")
    );

    expect(newReceiverBalance).toBe(receiverBalance + amount);
  }, 30000);

  it("Sending non-native asset on the same chain works", async () => {
    const sender: Sender = {
      keypair: alice,
      chain: 1836
    };

    const receiver: Receiver = {
      addressRaw: bob.addressRaw,
      type: AccountType.accountId32,
      chain: 1836,
    };

    const trappitProvider = new WsProvider("ws://127.0.0.1:9920");
    const trappistApi = await ApiPromise.create({
      provider: trappitProvider,
    });

    const lockdownMode = await getLockdownMode(trappistApi);
    if (lockdownMode) {
      await deactivateLockdown(trappistApi, alice);
    }

    // First create an asset.
    if (!(await getAsset(trappistApi, 0))) {
      await createAsset(trappistApi, sender.keypair, 0);
    }

    // Mint some assets to the creator.
    await mintAsset(trappistApi, sender.keypair, 0, 500);

    const amount = 200;

    const senderAccountBefore: any = (await trappistApi.query.assets.account(
      0,
      sender.keypair.address
    )).toHuman();

    const senderBalanceBefore = parseInt(senderAccountBefore.balance.replace(/,/g, ""));

    const receiverAccountBefore: any = (await trappistApi.query.assets.account(
      0,
      bob.address
    )).toHuman();

    const receiverBalanceBefore = receiverAccountBefore ? parseInt(receiverAccountBefore.balance.replace(/,/g, "")) : 0;

    // First lets add a chain.
    await addChain(identityContract, alice, 1836, {
      rpcUrls: ["ws://127.0.0.1:9920"],
      accountType: AccountType.accountId32,
    });

    const asset: Fungible = {
      multiAsset: {
        interior: {
          X2: [
            { PalletInstance: 41 }, // assets pallet
            { GeneralIndex: 0 },
          ],
        },
        parents: 0,
      },
      amount
    };
    const assetReserveChainId = 1836;

    await TransactionRouter.sendTokens(
      sender,
      receiver,
      assetReserveChainId,
      asset,
      {
        originApi: trappistApi,
        destApi: trappistApi
      }
    );

    const senderAccountAfter: any = (await trappistApi.query.assets.account(
      0,
      sender.keypair.address
    )).toHuman();

    const senderBalanceAfter = parseInt(senderAccountAfter.balance.replace(/,/g, ""));

    const receiverAccountAfter: any = (await trappistApi.query.assets.account(
      0,
      bob.address
    )).toHuman();

    console.log(receiverAccountAfter);
    const receiverBalanceAfter = parseInt(receiverAccountAfter.balance.replace(/,/g, ""));

    expect(senderBalanceAfter).toBe(senderBalanceBefore - amount);
    expect(receiverBalanceAfter).toBe(receiverBalanceBefore + amount);

  }, 180000);
});

const addChain = async (
  contract: IdentityContract,
  signer: KeyringPair,
  chainId: number,
  chain: ChainInfo
): Promise<void> => {
  await contract
    .withSigner(signer)
    .tx.addChain(chainId, chain);
};

const createAsset = async (
  api: ApiPromise,
  signer: KeyringPair,
  id: number
): Promise<void> => {
  const callTx = async (resolve: () => void) => {
    const unsub = await api.tx.assets
      .create(
        id,
        // Admin:
        signer.address,
        10 // min balance
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

const getAsset = async (api: ApiPromise, id: number): Promise<any> => {
  return (await api.query.assets.asset(id)).toHuman();
};

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
