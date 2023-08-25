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

    const senderBalanceBefore = await getBalance(rococoApi, alice.address);
    const receiverBalanceBefore = await getBalance(assetHubApi, bob.address);

    const amount = 4 * Math.pow(10, 12); // 4 KSM
    const assetReserveChainId = 0;

    const asset: Fungible = {
      multiAsset: {
        parents: 0,
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

    // Delay a bit just to be safe.
    await delay(5000);

    const senderBalanceAfter = await getBalance(rococoApi, alice.address);
    const receiverBalanceAfter = await getBalance(assetHubApi, bob.address);

    // Expect the balance to be possibly lower than `senderBalanceBefore - amount` since 
    // the fees also need to be paid.
    expect(Number(senderBalanceAfter)).toBeLessThanOrEqual(senderBalanceBefore - amount);

    // Tolerance for fee payment on the receiver side.
    const tolerance = 50000000;
    expect(Number(receiverBalanceAfter)).toBeGreaterThanOrEqual((receiverBalanceBefore + amount) - tolerance);
  }, 120000);
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
  const maybeBalance: any = (await api.query.system.account(who)).toPrimitive();
  if (maybeBalance && maybeBalance.data) {
    return maybeBalance.data.free;
  }
  return 0;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
