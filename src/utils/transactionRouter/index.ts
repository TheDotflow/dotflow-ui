import { ApiPromise, WsProvider } from "@polkadot/api";

import TransferAsset from "./transferAsset";
import { Fungible, Receiver, Sender } from "./types";
import IdentityContract from "../../../types/contracts/identity";

class TransactionRouter {
  public static async sendTokens(
    identityContract: IdentityContract,
    sender: Sender,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    if (sender.network === receiver.network && sender.keypair.addressRaw === receiver.addressRaw) {
      throw new Error("Cannot send tokens to yourself");
    }

    if (sender.network === receiver.network) {
      // We will extract all the chain information from the RPC node.
      const rpcUrl = (await identityContract.query.networkInfoOf(sender.network)).value
        .ok?.rpcUrl;

      const wsProvider = new WsProvider(rpcUrl);
      const api = await ApiPromise.create({ provider: wsProvider });

      await TransferAsset.send(
        api,
        sender,
        receiver,
        asset
      );
    } else {
      // Send cross-chain.
    }
  }
}

export default TransactionRouter;
