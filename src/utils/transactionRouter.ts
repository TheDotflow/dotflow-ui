import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import IdentityContract from "../../types/contracts/identity";
import { AccountType } from "../../types/types-arguments/identity";

class TransactionRouter {
  public static async sendTokens(
    identityContract: IdentityContract,
    sender: KeyringPair,
    originNetworkId: number,
    receiver: Uint8Array,
    receiverAccountType: AccountType,
    destinationNetworkId: number,
    multiAsset: any,
    amount: number
  ): Promise<void> {
    if (originNetworkId == destinationNetworkId && sender.addressRaw == receiver) {
      throw new Error("Cannot send tokens to yourself");
    }

    if (originNetworkId == destinationNetworkId) {
      // We will extract all the chain information from the RPC node.
      const rpcUrl = (await identityContract.query.networkInfoOf(originNetworkId)).value
        .ok?.rpcUrl;

      const wsProvider = new WsProvider(rpcUrl);
      const api = await ApiPromise.create({ provider: wsProvider });

      await this.sendOnSameBlockchain(
        api,
        sender,
        receiver,
        receiverAccountType,
        multiAsset,
        amount
      );
    } else {
      // Send cross-chain.
    }
  }

  private static async sendOnSameBlockchain(
    api: ApiPromise,
    sender: KeyringPair,
    receiver: Uint8Array,
    receiverAccountType: AccountType,
    multiAsset: any,
    amount: number
  ): Promise<void> {
    // We use XCM even for transfers that are occurring on the same chain. The
    // reason for this is that we cannot know what is the pallet and function
    // for transferring tokens since it can be different on each chain. For that
    // reason we will use the XCM `TransferAsset` instruction which is
    // standardized and as far as the chain has an XCM executor the transaction
    // will be executed correctly.

    const chainInfo = await api.registry.getChainProperties();
    if (!chainInfo) {
      throw new Error("Failed to get chain info");
    }

    const xcm = this.xcmTransferAssetMessage(
      receiver,
      receiverAccountType,
      multiAsset,
      amount
    );

    let xcmExecute: any;

    if (api.tx.xcmPallet) {
      // TODO: don't hardcode the max weight.
      xcmExecute = api.tx.xcmPallet.execute(xcm, 3000000000);
    } else if (api.tx.polkadotXcm) {
      xcmExecute = api.tx.polkadotXcm.execute(xcm, 3000000000);
    } else {
      throw new Error("The blockchain does not support XCM");
    }

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const unsub = await xcmExecute.signAndSend(sender, (result: any) => {
        if (result.status.isFinalized) {
          unsub();
          resolve();
        }
      })
    });
  }

  // Constructs a `TransferAsset` XCM message that will be executed when sending
  // tokens on the same chain.
  private static xcmTransferAssetMessage(
    receiverAddress: Uint8Array,
    receiverAccountType: AccountType,
    multiAsset: any,
    amount: number
  ): any {
    let receiverAccount;
    if (receiverAccountType == AccountType.accountId32) {
      receiverAccount = {
        AccountId32: {
          network: "Any",
          id: receiverAddress,
        },
      };
    } else if (receiverAccountType == AccountType.accountKey20) {
      receiverAccount = {
        AccountKey20: {
          network: "Any",
          id: receiverAddress,
        },
      };
    }

    const xcmMessage = {
      V2: [
        {
          TransferAsset: {
            assets: [
              {
                fun: {
                  Fungible: amount,
                },
                id: {
                  Concrete: multiAsset,
                },
              },
            ],
            beneficiary: {
              interior: {
                X1: receiverAccount,
              },
              parents: 0,
            },
          },
        },
      ],
    };
    return xcmMessage;
  }
}

export default TransactionRouter;
