import { ApiPromise, WsProvider } from "@polkadot/api";

import ReserveTransfer from "./reserveTransfer";
import TeleportTransfer from "./teleportTransfer";
import TransferAsset from "./transferAsset";
import { Fungible, Receiver, Sender } from "./types";
import IdentityContract from "../../../types/contracts/identity";
import { AccountType } from "../../../types/types-arguments/identity";
import { TeleportableRoute, teleportableRoutes } from "../../../teleportableRoutes";
import { getParaId } from "..";

// Responsible for handling all the transfer logic.
//
// Supports both non-cross-chain and cross-chain transfers.
//
// At the moment it doesn't support teleports.
class TransactionRouter {
  // Sends tokens to the receiver on the receiver chain.
  //
  // If the sender and receiver are on the same chain the asset gets sent by executing the xcm `TransferAsset` 
  // instruction. The reason we use xcm is because we don't know on which chain the transfer will be 
  // executed, so the only assumption we make is that the chain supports xcm.
  //
  // The other more complex case involves transferring the asset to a different blockchain. We are utilising 
  // reserve transfers for this. There are three different scenarios that can occur:
  //   1. The chain from which the transfer is ocurring the reserve chain of the asset. In this case we simply
  //      utilise the existing `limitedReserveTransferAssets` extrinsic.
  //   2. The destination chain is the reserve of the asset. This is a more complex case, so we need to construct
  //      our own xcm program to do this.
  //   3. Neither the sender or the destination chain are the reserve chains of the asset. In this case we do a
  //      'two-hop` reserve transfer. This is essentially pretty similar to the previous scenario, only difference
  //      being that we deposit the assets to the receiver's chain sovereign account on the reserve chain and then 
  //      do a separate `DepositAsset` instruction on the destination chain.
  public static async sendTokens(
    identityContract: IdentityContract,
    sender: Sender,
    receiver: Receiver,
    reserveChainId: number,
    asset: Fungible
  ): Promise<void> {
    if (sender.network === receiver.network && sender.keypair.addressRaw === receiver.addressRaw) {
      throw new Error("Cannot send tokens to yourself");
    }

    // The simplest case, both the sender and the receiver are on the same network:
    if (sender.network === receiver.network) {
      const api = await this.getApi(identityContract, sender.network);

      await TransferAsset.send(
        api,
        sender.keypair,
        receiver,
        asset
      );

      return;
    }

    const originApi = await this.getApi(identityContract, sender.network);
    const destApi = await this.getApi(identityContract, receiver.network);

    ensureContainsXcmPallet(destApi);

    const originParaId = await getParaId(originApi);
    const destParaId = await getParaId(destApi);

    const teleportableRoute: TeleportableRoute = {
      relayChain: process.env.RELAY_CHAIN ? process.env.RELAY_CHAIN : "",
      destParaId: destParaId,
      originParaId: originParaId,
      xcAsset: asset.multiAsset
    };

    // if (TeleportableRoutes.indexOf())

    // The sender chain is the reserve chain of the asset. This will simply use the existing
    // `limitedReserveTransferAssets` extrinsic
    if (sender.network == reserveChainId) {
      await ReserveTransfer.sendFromReserveChain(
        originApi,
        destParaId,
        sender.keypair,
        receiver,
        asset
      );
    } else if (receiver.network == reserveChainId) {
      // The destination chain is the reserve chain of the asset:
      await ReserveTransfer.sendToReserveChain(
        originApi,
        destParaId,
        sender.keypair,
        receiver,
        asset
      );
    } else {
      // The most complex case, the reserve chain is neither the sender or the destination chain.
      // For this we will have to send tokens accross the reserve chain. 

      const reserveChain = await this.getApi(identityContract, reserveChainId);
      ensureContainsXcmPallet(reserveChain);

      const reserveParaId = await getParaId(reserveChain);

      await ReserveTransfer.sendAcrossReserveChain(
        originApi,
        destParaId,
        reserveParaId,
        sender.keypair,
        receiver,
        asset
      );
    }
  }

  // Simple helper function to get the api of a chain with the corresponding id. 
  private static async getApi(identityContract: IdentityContract, networkId: number): Promise<ApiPromise> {
    const rpcUrl = (await identityContract.query.networkInfoOf(networkId)).value
      .ok?.rpcUrl;

    const wsProvider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({ provider: wsProvider });

    return api;
  }
}

export default TransactionRouter;

// Returns the destination of an xcm transfer.
//
// The destination is an entity that will process the xcm message(i.e a relaychain or a parachain). 
export const getDestination = (isOriginPara: boolean, destParaId: number, isDestPara: boolean): any => {
  const parents = isOriginPara ? 1 : 0;

  if (isDestPara) {
    return {
      V2:
      {
        parents,
        interior: {
          X1: { Parachain: destParaId }
        }
      }
    }
  } else {
    // If the destination is not a parachain it is basically a relay chain.
    return {
      V2:
      {
        parents,
        interior: "Here"
      }
    }
  }
}

// Returns the beneficiary of an xcm reserve or teleport transfer.
//
// The beneficiary is an interior entity of the destination that will actually receive the tokens.
export const getTransferBeneficiary = (receiver: Receiver): any => {
  const receiverAccount = getReceiverAccount(receiver);

  return {
    V2: {
      parents: 0,
      interior: {
        X1: {
          ...receiverAccount
        }
      }
    }
  };
}

export const getReceiverAccount = (receiver: Receiver): any => {
  if (receiver.type == AccountType.accountId32) {
    return {
      AccountId32: {
        network: "Any",
        id: receiver.addressRaw,
      },
    };
  } else if (receiver.type == AccountType.accountKey20) {
    return {
      AccountKey20: {
        network: "Any",
        id: receiver.addressRaw,
      },
    };
  }
}

// Returns a proper MultiAsset.
export const getMultiAsset = (asset: Fungible): any => {
  return {
    V2: [
      {
        fun: {
          Fungible: asset.amount,
        },
        id: {
          Concrete: asset.multiAsset,
        },
      },
    ]
  }
}

const ensureContainsXcmPallet = (api: ApiPromise) => {
  if (!(api.tx.xcmPallet || api.tx.polkadotXcm)) {
    throw new Error("The blockchain does not support XCM");
  }
}
