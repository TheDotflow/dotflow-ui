import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { Fungible, Receiver } from "./types";
import { getParaId } from "..";
import { getDestination, getMultiAsset, getTransferBeneficiary } from ".";

class TeleportTransfer {
  public static async send(
    originApi: ApiPromise,
    destinationApi: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible
  ): Promise<void> {
    const xcmPallet = originApi.tx.xcmPallet || originApi.tx.polkadotXcm;

    if (!xcmPallet) {
      throw new Error("The blockchain does not support XCM");
    };

    // eslint-disable-next-line no-prototype-builtins
    const isOriginPara = originApi.query.hasOwnProperty("parachainInfo");

    const destParaId = await getParaId(destinationApi);

    const destination = getDestination(isOriginPara, destParaId, destParaId >= 0);
    const beneficiary = getTransferBeneficiary(receiver);
    const multiAsset = getMultiAsset(asset);

    const feeAssetItem = 0;
    const weightLimit = "Unlimited";

    const teleport = xcmPallet.limitedTeleportAssets(
      destination,
      beneficiary,
      multiAsset,
      feeAssetItem,
      weightLimit
    );

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const unsub = await teleport.signAndSend(sender, (result: any) => {
        if (result.status.isFinalized) {
          unsub();
          resolve();
        }
      })
    });
  }
}

export default TeleportTransfer;
