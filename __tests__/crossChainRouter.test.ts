import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { Fungible, Receiver, Sender } from "@/utils/transactionRouter/types";

import TransactionRouter from "../src/utils/transactionRouter";
import IdentityContractFactory from "../types/constructors/identity";
import IdentityContract from "../types/contracts/identity";
import { AccountType, NetworkInfo } from "../types/types-arguments/identity";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");
const keyring = new Keyring({ type: "sr25519" });

describe("TransactionRouter Cross-chain", () => {
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

    await addNetwork(identityContract, alice, {
      rpcUrl: "ws://127.0.0.1:9910",
      accountType: AccountType.accountId32,
    });

    await addNetwork(identityContract, alice, {
      rpcUrl: "ws://127.0.0.1:9920",
      accountType: AccountType.accountId32,
    });
  });

  it("Transferring cross-chain works", async () => {
    const sender: Sender = {
      keypair: alice,
      network: 0
    };

    const receiver: Receiver = {
      addressRaw: bob.addressRaw,
      type: AccountType.accountId32,
      network: 1,
    };

    // We have two asset hubs in our local network.

    const assetHubProvider = new WsProvider("ws://127.0.0.1:9910");
    const assetHubApi = await ApiPromise.create({
      provider: assetHubProvider,
    });

    const trappistProvider = new WsProvider("ws://127.0.0.1:9920");
    const trappistApi = await ApiPromise.create({
      provider: trappistProvider,
    });

    // Create assets on both networks

    if (!(await getAsset(assetHubApi, 0))) {
      await createAsset(assetHubApi, sender.keypair, 0);
    }

    if (!(await getAsset(trappistApi, 0))) {
      await createAsset(trappistApi, sender.keypair, 0);
    }

    // Mint some assets to the creator.
    await mintAsset(assetHubApi, sender.keypair, 0, 500);

    const amount = Math.pow(10, 12);

    const asset: Fungible = {
      multiAsset: {
        interior: "Here",
        parents: 0,
      },
      amount
    };

    await TransactionRouter.sendTokens(
      identityContract,
      sender,
      receiver,
      asset
    );
  }, 60000);
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
    let forceCreate = api.tx.assets.forceCreate(id, signer.address, true, 10);
    const unsub = await api.tx.sudo.sudo(forceCreate)
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
