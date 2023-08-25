import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import TransactionRouter from "../src/utils/transactionRouter";
import { Fungible, Receiver, Sender } from "../src/utils/transactionRouter/types";

import IdentityContractFactory from "../types/constructors/identity";
import IdentityContract from "../types/contracts/identity";

import { AccountType, NetworkInfo } from "../types/types-arguments/identity";

const WS_ROROCO_LOCAL = "ws://127.0.0.1:9900";
const WS_ASSET_HUB_LOCAL = "ws://127.0.0.1:9910";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");
const keyring = new Keyring({ type: "sr25519" });

describe("TransactionRouter Cross-chain teleport", () => {
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
      rpcUrl: WS_ROROCO_LOCAL,
      accountType: AccountType.accountId32,
    });

    await addNetwork(identityContract, alice, {
      rpcUrl: WS_ASSET_HUB_LOCAL,
      accountType: AccountType.accountId32,
    });
  });


  test("Teleporting ROC works", async () => {
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

    const receiverBalanceBefore = await getBalance(rococoApi, bob.address);
    const senderBalanceBefore = await getBalance(assetHubApi, alice.address);

    const amount = 4000000000000;
    const assetReserveChainId = 0;

    const asset: Fungible = {
      multiAsset: {
        interior: "Here"
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

const getBalance = async (api: ApiPromise, who: string): Promise<any> => {
  const maybeBalance: any = (await api.query.system.account(who)).toJSON();
  if (maybeBalance && maybeBalance.data) {
    return maybeBalance.data.free;
  }
  return 0;
}