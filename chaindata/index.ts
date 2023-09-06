import { gql, request } from "graphql-request"

const graphqlUrl = "https://squid.subsquid.io/chaindata/v/v4/graphql"

/// NOTE: this file is copied from the talisman chaindata.

type Chain = {
  id: string;
  name: string;
  paraId: number | null;
  relay: {
    id: string
  } | null;
  rpcs: Array<{ url: string }>,
  logo: string
}

type Token = {
  data: {
    id: string;
    logo: string;
    type: string;
    symbol: string;
    decimals: number;
    isTestnet: boolean;
    evmNetwork: {
      id: string;
    };
    themeColor: string;
    coingeckoId: string;
  }
}

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
    logo
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
  private chains: Array<Chain> = [];
  private tokens: Array<Token> = [];

  public async load(): Promise<void> {
    const chainsResult: any = await request(graphqlUrl, chainsQuery);
    this.chains = chainsResult.chains;

    const tokensResult: any = await request(graphqlUrl, tokensQuery);
    this.tokens = tokensResult.tokens;
  }

  public getChains(): Array<Chain> {
    return this.chains;
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }
}
