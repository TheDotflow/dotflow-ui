import TransactionRouter from "../src/utils/transactionRouter";
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";
import IdentityContractFactory from "../types/constructors/identity";
import IdentityContract from "../types/contracts/identity";
import { AccountType, NetworkInfo } from "../types/types-arguments/identity";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");
const keyring = new Keyring({ type: 'sr25519' });

describe("TransactionRouter",() => {
  let api: ApiPromise;
  let alice: KeyringPair;
  let bob: KeyringPair;
  let identityContract: any;

  beforeEach(async function (): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider, noInitWarn: true });
    alice = keyring.addFromUri('//Alice');
    bob = keyring.addFromUri('//Bob');

    const factory = new IdentityContractFactory(api, alice);
    identityContract = new IdentityContract(
      (
        await factory.new()
      ).address,
      alice,
      api
    );
  });

  it("Can't send tokens to yourself", async () => {
    const sender = alice;
    const receiver = alice;

    // First lets add a network and create an identity.

    await addNetwork(identityContract, alice, { rpcUrl: "ws://127.0.0.1:9944", accountType: AccountType.accountId32 });

    await expect(TransactionRouter.sendTokens(
      identityContract,
      sender,
      0, // origin network
      receiver.addressRaw,
      AccountType.accountId32,
      0, // destination network
      {}, // multi asset
      1000
    )).rejects.toThrow("Cannot send tokens to yourself");
  });

  it("Sending native asset on the same network works", async () => {
    const sender = alice;
    const receiver = bob;

    const rococoApi = await ApiPromise.create({ provider: wsProvider });

    // @ts-ignore
    var { data: balance } = await rococoApi.query.system.account(receiver.address);
    const receiverBalance = parseInt(balance.free.toHuman().replace(/,/g, ''));

    // First lets add a network.
    await addNetwork(identityContract, alice, { rpcUrl: "ws://127.0.0.1:62735", accountType: AccountType.accountId32 });

    const amount = Math.pow(10, 12);

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
        parents: 0
      },
      amount
    );

    // @ts-ignore
    var { data: balance } = await rococoApi.query.system.account(receiver.address);
    const newReceiverBalance = parseInt(balance.free.toHuman().replace(/,/g, ''));

    expect(newReceiverBalance).toBe(receiverBalance + amount);
  }, 10000);
});

const addNetwork = async (contract: IdentityContract, signer: KeyringPair, network: NetworkInfo): Promise<void> => {
  const _addNetworkResult = await contract
    .withSigner(signer)
    .tx.addNetwork(network);
}
