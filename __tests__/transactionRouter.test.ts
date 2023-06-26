import TransactionRouter from "../src/utils/transactionRouter";
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { KeyringPair } from "@polkadot/keyring/types";

const wsProvider = new WsProvider("ws://127.0.0.1:9944");
const keyring = new Keyring({ type: 'sr25519' });

describe("TransactionRouter",() => {
  let api: ApiPromise;
  let alice: KeyringPair;
  let bob: KeyringPair;

  beforeEach(async function (): Promise<void> {
    api = await ApiPromise.create({ provider: wsProvider, noInitWarn: true });
    alice = keyring.addFromUri('//Alice');
    bob = keyring.addFromUri('//Bob');
  });

  test("Can't send tokens to yourself", () => {
    const sender = alice;
    const receiver = alice;
    expect(() => TransactionRouter.sendTokens(
      sender.address,
      "polkadot",
      receiver.address,
      "polkadot",
      "dot",
      1000
    )).toThrow("Cannot send tokens to yourself");
  });
});
