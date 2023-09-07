export type ChainId = number;

export type AccountType = 'AccountId32' | 'AccountId20';

export type ChainConsts = {
  name: string;
  ss58Prefix: number;
  paraId: number;
  logo: string;
}

export type ChainInfo = ChainConsts & {
  rpcUrls: string[];
  accountType: AccountType;
}

export type Chain = {
  id: ChainId;
  name: ChainInfo;
}

export type Address = {
  chainId: ChainId;
  address: string;
}

export type Chains = Record<ChainId, ChainInfo>;

export type IdentityNo = number | null;

export type IdentityRecord = {
  nickName: null | string;
  identityNo: number;
}