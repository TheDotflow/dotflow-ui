import { ChainConsts } from "@/contracts/types";
import { gql, request } from "graphql-request"

const graphqlUrl = "https://squid.subsquid.io/chaindata/v/v4/graphql"

/// NOTE: this file is copied from the talisman chaindata.

const chainsQuery = gql`
query chains {
  chains(orderBy: sortIndex_ASC) {
    id
    name
    paraId
    relay {
      id
    }
    rpcs {
      url
    }
  }
}
`;

const tokensQuery = gql`
query tokens {
  tokens(orderBy: id_ASC) {
    data
  }
}
`;

export class Chaindata {
  private chains: Array<any> = [];
  private tokens: Array<any> = [];

  public async load(): Promise<void> {
    const chainsResult: any = await request(graphqlUrl, chainsQuery);
    this.chains = chainsResult.chains;

    const tokensResult: any = await request(graphqlUrl, chainsQuery);
    this.tokens = tokensResult.tokens;
  }

  public getChains(): Array<any> {
    return this.chains;
  }

  public getTokens(): Array<any> {
    return this.tokens;
  }
}
