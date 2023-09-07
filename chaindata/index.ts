import { RELAY_CHAIN } from "@/consts";
import { gql, request } from "graphql-request"

const graphqlUrl = "https://squid.subsquid.io/chaindata/v/v4/graphql"

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
    assetId?: any;
    onChainId?: any;
    type: string;
    symbol: string;
    decimals: number;
    isTestnet: boolean;
    evmNetwork?: {
      id: string;
    };
    themeColor: string;
    coingeckoId: string;
  }
}

const chainQuery = gql`
query ChainByRelay($paraId: Int!, $relayId: String!) {
  chains(
    where: {
      paraId_eq: $paraId
      relay: { id_eq: $relayId }
    }
  ) {
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

const relayQuery = gql`
query ChainByParaIdAndRelay($relayId: String!) {
  chains(where: {paraId_isNull: true, id_eq: $relayId}) {
    id
    name
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
  private tokens: Array<Token> = [];

  public async load(): Promise<void> {
    const tokensResult: any = await request(graphqlUrl, tokensQuery);
    this.tokens = tokensResult.tokens;
  }

  public async getChain(chainId: number): Promise<Chain> {
    if (chainId === 0) {
      const result: any = await request(graphqlUrl, relayQuery, {
        relayId: RELAY_CHAIN
      });
      return result.chains[0];
    } else {
      const result: any = await request(graphqlUrl, chainQuery, {
        paraId: chainId,
        relayId: RELAY_CHAIN
      });
      return result.chains[0];
    }
  }

  public getTokens(): Array<Token> {
    return this.tokens;
  }
}
