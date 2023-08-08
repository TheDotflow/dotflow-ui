import { ApiPromise, WsProvider } from "@polkadot/api";

import TransferAsset from "./transferAsset";
import { Fungible, Receiver, Sender } from "./types";
import IdentityContract from "../../../types/contracts/identity";
import ReserveTransfer from "./reserveTransfer";

class TransactionRouter {
  public static async sendTokens(
    identityContract: IdentityContract,
    sender: Sender,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    console.log("HEY");
    if (sender.network === receiver.network && sender.keypair.addressRaw === receiver.addressRaw) {
      throw new Error("Cannot send tokens to yourself");
    }

    if (sender.network === receiver.network) {
      const api = await this.getApi(identityContract, sender.network);

      await TransferAsset.send(
        api,
        sender.keypair,
        receiver,
        asset
      );
    } else {
      const originApi = await this.getApi(identityContract, sender.network);
      const destApi = await this.getApi(identityContract, receiver.network);

      console.log("HEY 2");
      await ReserveTransfer.send(
        originApi,
        destApi,
        sender.keypair,
        receiver,
        asset
      );
    }
  }

  private static async getApi(identityContract: IdentityContract, networkId: number): Promise<ApiPromise> {
    const rpcUrl = (await identityContract.query.networkInfoOf(networkId)).value
      .ok?.rpcUrl;

    console.log(rpcUrl);

    const wsProvider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({ provider: wsProvider });

    return api;
  }
}

export default TransactionRouter;
