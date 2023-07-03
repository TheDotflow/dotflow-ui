import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { AccountType } from "../../types/types-arguments/identity";
import IdentityContract from "../../types/contracts/identity";

class TransactionRouter {
  public static async sendTokens(
    contract: IdentityContract,
    sender: KeyringPair,
    originNetwork: number,
    receiver: Uint8Array,
    receiverAccountType: AccountType,
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
        sender,
        receiver,
        receiverAccountType,
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
    sender: KeyringPair,
    receiver: Uint8Array,
    receiverAccountType: AccountType,
    token: any,
    amount: number
  ): Promise<void> {
    // Just a simple transfer.

    const chainInfo = await api.registry.getChainProperties();
    if (!chainInfo) {
      throw new Error("Failed to get chain info");
    }

    const xcm = this.xcmTransferAssetMessage(receiver, receiverAccountType, token, amount);

    let xcmExecute;

    if (api.tx.xcmPallet) {
      // TODO: don't hardcode the max weight.
      xcmExecute = api.tx.xcmPallet.execute(xcm, 3000000000);
    } else if (api.tx.polkadotXcm) {
      xcmExecute = api.tx.polkadotXcm.execute(xcm, 3000000000);
    } else {
      throw new Error("The blockchain does not support XCM");
    }

    const hash = await xcmExecute.signAndSend(sender);

    // TODO Remove the log:
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
    receiverAccountType: AccountType,
    multiAsset: any,
    amount: number
  ): any {
    let receiverAccount;
    if(receiverAccountType == AccountType.accountId32) {
      receiverAccount = {
        AccountId32: {
          network: "Any",
          id: receiverAddress,
        }
      };
    }else if(receiverAccountType == AccountType.accountKey20){
      receiverAccount = {
        AccountKey20: {
          network: "Any",
          id: receiverAddress,
        }
      };
    }

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
              X1: receiverAccount
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
