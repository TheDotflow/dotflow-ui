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
query tokens($relayId: String!) {
  tokens(orderBy: id_ASC, where: {squidImplementationDetailChain: {relay: {id_eq: $relayId}}}) {
    data
  }
}
`;

const relayTokensQuery = gql`
query tokens {
  tokens(orderBy: id_ASC, where: {squidImplementationDetailChain: {relay_isNull: true}}) {
    data
  }
}
`;

export class Chaindata {
  public async getChain(chainId: number, relay: string): Promise<Chain> {
    if (chainId === 0) {
      const result: any = await request(graphqlUrl, relayQuery, {
        relayId: relay
      });
      return result.chains[0];
    } else {
      const result: any = await request(graphqlUrl, chainQuery, {
        paraId: chainId,
        relayId: relay
      });
      return result.chains[0];
    }
  }

  public async getTokens(relay: string | null): Promise<Array<Token>> {
    if (relay === null) {
      const tokensResult: any = await request(graphqlUrl, relayTokensQuery, {
        relayId: relay
      });

      return tokensResult.tokens;
    } else {
      const tokensResult: any = await request(graphqlUrl, tokensQuery, {
        relayId: relay
      });

      return tokensResult.tokens;
    }
  }
}
