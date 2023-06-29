import { KeyringPair } from "@polkadot/keyring/types";
import IdentityContract from "../../types/contracts/identity";

class TransactionRouter {
  public static sendTokens(
    api: any,
    contract: IdentityContract,
    sender: KeyringPair,
    originNetwork: number, 
    receiver: string, 
    destinationNetwork: number, 
    token: string,
    amount: number
  ): any {
    if(originNetwork == destinationNetwork && sender.address == receiver) {
      throw new Error("Cannot send tokens to yourself");
    }
    if(originNetwork == destinationNetwork) {
      this.sendOnSameBlockchain(api, contract, sender, receiver, originNetwork, token, amount);
    }else {
      this.sendViaXcm(sender, originNetwork, receiver, destinationNetwork, token, amount);
    }
  }

  private static async sendOnSameBlockchain(
    api: any,
    contract: IdentityContract,
    sender: KeyringPair, 
    receiver: string, 
    network: number,
    token: string, 
    amount: number
  ): Promise<void> {
    // Just a simple transfer.
    const chainInfo = await api.registry.getChainProperties()
    const receiverAddress = await contract.query.transactionDestination(receiver, network);

    const nativeToken = chainInfo.tokenSymbol.toString()? chainInfo.tokenSymbol.toString().toLowerCase() : "unit";

    console.log(receiverAddress);
    if(token == nativeToken) {
    }else {
    }
  }

  private static sendViaXcm(
    sender: KeyringPair,
    originNetwork: number, 
    receiver: string, 
    destinationNetwork: number, 
    token: string, 
    amount: number
  ) {

  }
}

export default TransactionRouter;
