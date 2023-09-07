import { gql, request } from 'graphql-request';

const graphqlUrl = 'https://squid.subsquid.io/chaindata/v/v4/graphql';

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

export const getChains = async (): Promise<Array<any>> => {
  const result: any = await request(graphqlUrl, chainsQuery);
  return result.chains;
};

export const getTokens = async (): Promise<Array<any>> => {
  const result: any = await request(graphqlUrl, tokensQuery);
  return result.tokens;
};
