import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import IdentityContract from "../../types/contracts/identity";

class TransactionRouter {
  public static async sendTokens(
    contract: IdentityContract,
    sender: KeyringPair,
    originNetwork: number,
    receiver: Uint8Array,
    destinationNetwork: number,
    token: any,
    amount: number
  ): Promise<any> {
    if (originNetwork == destinationNetwork && sender.addressRaw == receiver) {
      throw new Error("Cannot send tokens to yourself");
    }

    if (originNetwork == destinationNetwork) {
      const rpcUrl = (await contract.query.networkInfoOf(originNetwork)).value.ok?.rpcUrl;
      const wsProvider = new WsProvider(rpcUrl);
      const api = await ApiPromise.create({ provider: wsProvider });

      await this.sendOnSameBlockchain(
        api,
        contract,
        sender,
        receiver,
        originNetwork,
        token,
        amount
      );
    } else {
      await this.sendViaXcm(
        sender,
        originNetwork,
        receiver,
        destinationNetwork,
        token,
        amount
      );
    }
  }

  private static async sendOnSameBlockchain(
    api: ApiPromise,
    contract: IdentityContract,
    sender: KeyringPair,
    receiver: Uint8Array,
    network: number,
    token: any,
    amount: number
  ): Promise<void> {
    // Just a simple transfer.

    const chainInfo = await api.registry.getChainProperties();
    if (!chainInfo) {
      throw new Error("Failed to get chain info");
    }

    const xcm = this.xcmTransferAssetMessage(receiver, token, amount);

    let xcmExecute;

    if (api.tx.xcmPallet) {
      xcmExecute = api.tx.xcmPallet.execute(xcm, 0);
    } else if (api.tx.polkadotXcm) {
      xcmExecute = api.tx.polkadotXcm.execute(xcm, 0);
    } else {
      throw new Error("The blockchain does not support XCM");
    }

    const hash = await xcmExecute.signAndSend(sender);

    console.log("Transfer sent with hash", hash.toHex());
  }

  private static sendViaXcm(
    sender: KeyringPair,
    originNetwork: number,
    receiver: Uint8Array,
    destinationNetwork: number,
    token: string,
    amount: number
  ) {}

  private static xcmTransferAssetMessage(
    receiverAddress: Uint8Array,
    multiAsset: any,
    amount: number
  ): any {
    const xcmMessage = {
      V2: [{
        TransferAsset: {
          assets: [
            {
              fun: {
                Fungible: amount
              },
              id: {
                Concrete: multiAsset
              }
            }
          ],
          beneficiary: {
            interior: {
              X1: {
                // TODO: Don't hardcode the account type.
                AccountId32: {
                  network: "Any",
                  id: receiverAddress,
                },
              }
            },
            parents: 0
          }
        },
      }]
    };
    return xcmMessage;
  }
}

export default TransactionRouter;
