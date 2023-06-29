import TransactionRouter from "../src/utils/transactionRouter";
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";
import IdentityContractFactory from "../types/constructors/identity";
import IdentityContract from "../types/contracts/identity";

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

  test("Can't send tokens to yourself", () => {
    const sender = alice;
    const receiver = alice;
    expect(() => TransactionRouter.sendTokens(
      api,
      identityContract,
      sender,
      0, // origin network
      receiver.address,
      0, // destination network
      "dot",
      1000
    )).toThrow("Cannot send tokens to yourself");
  });

  test("Sending native asset on the same network works", () => {
    const sender = alice;
    const receiver = bob;

    TransactionRouter.sendTokens(
      api,
      identityContract,
      sender,
      0, // origin network
      receiver.address,
      0, // destination network
      "unit",
      1000
    );
  })
});
