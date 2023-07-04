import TransactionRouter from "../src/utils/transactionRouter";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import IdentityContractFactory from "../types/constructors/identity";
import IdentityContract from "../types/contracts/identity";
import { AccountType, NetworkInfo } from "../types/types-arguments/identity";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");
const keyring = new Keyring({ type: "sr25519" });

describe("TransactionRouter", () => {
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
    const sender = alice;
    const receiver = alice;

    // First lets add a network and create an identity.

    await addNetwork(identityContract, alice, {
      rpcUrl: "ws://127.0.0.1:4242",
      accountType: AccountType.accountId32,
    });

    await expect(
      TransactionRouter.sendTokens(
        identityContract,
        sender,
        0, // origin network
        receiver.addressRaw,
        AccountType.accountId32,
        0, // destination network
        {}, // multi asset
        1000
      )
    ).rejects.toThrow("Cannot send tokens to yourself");
  });

  it("Sending native asset on the same network works", async () => {
    const sender = alice;
    const receiver = bob;

    const rococoProvider = new WsProvider("ws://127.0.0.1:4242");
    const rococoApi = await ApiPromise.create({ provider: rococoProvider });

    // @ts-ignore
    var { data: balance } = await rococoApi.query.system.account(
      receiver.address
    );
    const receiverBalance = parseInt(balance.free.toHuman().replace(/,/g, ""));

    // First lets add a network.
    await addNetwork(identityContract, alice, {
      rpcUrl: "ws://127.0.0.1:4242",
      accountType: AccountType.accountId32,
    });

    const amount = Math.pow(10, 12);

    // TODO: the token transfer for some reason fails.
    await TransactionRouter.sendTokens(
      identityContract,
      sender,
      0, // origin network
      receiver.addressRaw,
      AccountType.accountId32,
      0, // destination network
      // MultiAsset:
      {
        interior: "Here",
        parents: 0,
      },
      amount
    );

    // @ts-ignore
    var { data: balance } = await rococoApi.query.system.account(
      receiver.address
    );
    const newReceiverBalance = parseInt(
      balance.free.toHuman().replace(/,/g, "")
    );

    expect(newReceiverBalance).toBe(receiverBalance + amount);
  }, 30000);

  it("Sending non-native asset on the same network works", async () => {
    const sender = alice;
    const receiver = bob;

    const statemineProvider = new WsProvider("ws://127.0.0.1:4243");
    const statemineApi = await ApiPromise.create({
      provider: statemineProvider,
    });

    // First create an asset.
    if (!(await getAsset(statemineApi, 0))) {
      await createAsset(statemineApi, sender, 0);
    }

    // Mint some assets to the creator.
    await mintAsset(statemineApi, sender, 0, 500);

    const amount = 10000;

    // First lets add a network.
    await addNetwork(identityContract, alice, {
      rpcUrl: "ws://127.0.0.1:4243",
      accountType: AccountType.accountId32,
    });

    await TransactionRouter.sendTokens(
      identityContract,
      sender,
      0, // origin network
      receiver.addressRaw,
      AccountType.accountId32,
      0, // destination network
      // MultiAsset:
      {
        interior: {
          X2: [
            { PalletInstance: 50 }, // assets pallet
            { GeneralIndex: 0 },
          ],
        },
        parents: 0,
      },
      amount
    );
  }, 120000);
});

const addNetwork = async (
  contract: IdentityContract,
  signer: KeyringPair,
  network: NetworkInfo
): Promise<void> => {
  const _addNetworkResult = await contract
    .withSigner(signer)
    .tx.addNetwork(network);
};

const createAsset = async (
  api: ApiPromise,
  signer: KeyringPair,
  id: number
): Promise<void> => {
  return new Promise(async (resolve) => {
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
  });
};

const mintAsset = async (
  api: ApiPromise,
  signer: KeyringPair,
  id: number,
  amount: number
): Promise<void> => {
  return new Promise(async (resolve) => {
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
  });
};

const getAsset = async (api: ApiPromise, id: number): Promise<any> => {
  return (await api.query.assets.asset(id)).toHuman();
};
