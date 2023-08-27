import { ApiPromise } from "@polkadot/api";

import ReserveTransfer from "./reserveTransfer";
import { TeleportableRoute, teleportableRoutes } from "./teleportableRoutes";
import TeleportTransfer from "./teleportTransfer";
import TransferAsset from "./transferAsset";
import { Fungible, Receiver, Sender, TransferRpcApis } from "./types";
import { AccountType } from "../../../types/types-arguments/identity";

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
    sender: Sender,
    receiver: Receiver,
    reserveChainId: number,
    asset: Fungible,
    transferRpcApis: TransferRpcApis
  ): Promise<void> {
    if (sender.chain === receiver.chain && sender.keypair.addressRaw === receiver.addressRaw) {
      throw new Error("Cannot send tokens to yourself");
    }

    // The simplest case, both the sender and the receiver are on the same chain:
    if (sender.chain === receiver.chain) {
      await TransferAsset.send(
        transferRpcApis.originApi,
        sender.keypair,
        receiver,
        asset
      );

      return;
    }

    ensureContainsXcmPallet(transferRpcApis.destApi);

    const originParaId = sender.chain;
    const destParaId = receiver.chain;

    const maybeTeleportableRoute: TeleportableRoute = {
      relayChain: process.env.RELAY_CHAIN ? process.env.RELAY_CHAIN : "rococo",
      originParaId: originParaId,
      destParaId: destParaId,
      multiAsset: asset.multiAsset
    };

    if (teleportableRoutes.some(route => JSON.stringify(route) === JSON.stringify(maybeTeleportableRoute))) {
      // The asset is allowed to be teleported between the origin and the destination.
      await TeleportTransfer.send(transferRpcApis.originApi, transferRpcApis.destApi, sender.keypair, receiver, asset);
      return;
    }

    // The sender chain is the reserve chain of the asset. This will simply use the existing
    // `limitedReserveTransferAssets` extrinsic
    if (sender.chain == reserveChainId) {
      await ReserveTransfer.sendFromReserveChain(
        transferRpcApis.originApi,
        destParaId,
        sender,
        receiver,
        asset
      );
    } else if (receiver.chain == reserveChainId) {
      // The destination chain is the reserve chain of the asset:
      await ReserveTransfer.sendToReserveChain(
        transferRpcApis.originApi,
        destParaId,
        sender,
        receiver,
        asset
      );
    } else {
      // The most complex case, the reserve chain is neither the sender or the destination chain.
      // For this we will have to send tokens accross the reserve chain. 

      if (!transferRpcApis.reserveApi) {
        throw new Error("The reserve api must be specified when doing two hop reserve transfers");
      }

      ensureContainsXcmPallet(transferRpcApis.reserveApi);
      const reserveParaId = reserveChainId;

      await ReserveTransfer.sendAcrossReserveChain(
        transferRpcApis.originApi,
        destParaId,
        reserveParaId,
        sender,
        receiver,
        asset
      );
    }
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
        chain: "Any",
        id: receiver.addressRaw,
      },
    };
  } else if (receiver.type == AccountType.accountKey20) {
    return {
      AccountKey20: {
        chain: "Any",
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
