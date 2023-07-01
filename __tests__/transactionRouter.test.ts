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
    //const receiverIdentityNo = await createIdentityWithData(identityContract, receiver);

    await expect(TransactionRouter.sendTokens(
      identityContract,
      sender,
      0, // origin network
      receiver.addressRaw,
      0, // destination network
      {}, // multi asset
      1000
    )).rejects.toThrow("Cannot send tokens to yourself");
  });

  it("Sending native asset on the same network works", async () => {
    const sender = alice;
    const receiver = bob;

    // First lets add a network.
    await addNetwork(identityContract, alice, { rpcUrl: "ws://127.0.0.1:50941", accountType: AccountType.accountId32 });

    await TransactionRouter.sendTokens(
      identityContract,
      sender,
      0, // origin network
      receiver.addressRaw,
      0, // destination network
      // MultiAsset:
      {
        interior: "Here",
        parents: 0
      },
      1 * Math.pow(10, 12)
    );
  });
});

const addNetwork = async (contract: IdentityContract, signer: KeyringPair, network: NetworkInfo): Promise<void> => {
  const _addNetworkResult = await contract
    .withSigner(signer)
    .tx.addNetwork(network);
}

const createIdentityWithData = async (contract: IdentityContract, signer: KeyringPair): Promise<number> => {
  const _createIdentityResult = (await contract
    .withSigner(signer)
    .tx.createIdentity());
  
  const identityNo = (await contract
    .withSigner(signer)
    .query.identityOf(signer.address)).value.ok;
  
  if(identityNo != null) {
    const _addAddressResult = (await contract
      .withSigner(signer)
      .tx.addAddress(0, signer.address));

    return identityNo;
  }
  throw new Error("Failed to get identity no");
}
