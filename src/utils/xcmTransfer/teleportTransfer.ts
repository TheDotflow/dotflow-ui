import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { Signer } from "@polkadot/types/types";

import { getDestination, getMultiAsset, getTransferBeneficiary } from ".";
import { Fungible, Receiver } from "./types";
import { getParaId } from "..";

class TeleportTransfer {
  public static async send(
    originApi: ApiPromise,
    destApi: ApiPromise,
    sender: KeyringPair,
    receiver: Receiver,
    asset: Fungible,
    signer?: Signer
  ): Promise<void> {
    const xcmPallet = originApi.tx.xcmPallet || originApi.tx.polkadotXcm;

    if (!xcmPallet) {
      throw new Error("The blockchain does not support XCM");
    };

    // eslint-disable-next-line no-prototype-builtins
    const isOriginPara = originApi.query.hasOwnProperty("parachainInfo");

    const destParaId = await getParaId(destApi);

    const destination = getDestination(isOriginPara, destParaId, destParaId > 0);
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

    if (signer) originApi.setSigner(signer);

    const account = signer ? sender.address : sender;

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const unsub = await teleport.signAndSend(account, (result: any) => {
          if (result.status.isFinalized) {
            unsub();
            if (result.dispatchError !== undefined) {
              reject(result.dispatchError)
            } else {
              resolve(result)
            }
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default TeleportTransfer;
