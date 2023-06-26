class TransactionRouter {
  public static sendTokens(
    sender: string,
    originChain: string, 
    receiver: string, 
    destinationChain: string, 
    token: string, 
    amount: number
  ): any {
    if(originChain == destinationChain && sender == receiver) {
      throw new Error("Cannot send tokens to yourself");
    }

    if(originChain == destinationChain) {
      this.sendOnSameBlockchain(sender, receiver, originChain, token, amount);
    }else {
      this.sendViaXcm(sender, originChain, receiver, destinationChain, token, amount);
    }
  }

  private static sendOnSameBlockchain(
    sender: string, 
    receiver: string, 
    chain: string, 
    token: string, 
    amount: number
  ): any {
    
  }

  private static sendViaXcm(
    sender: string,
    originChain: string, 
    receiver: string, 
    destinationChain: string, 
    token: string, 
    amount: number
  ) {

  }
}

export default TransactionRouter;
