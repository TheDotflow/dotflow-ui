export type NetworkId = number;

export type AccountType = 'AccountId32' | 'AccountId20';

export type NetworkConsts = {
  name: string;
  ss58Prefix: number;
  paraId: number;
}

export type NetworkInfo = NetworkConsts & {
  rpcUrls: string[];
  accountType: AccountType;
}

export type Network = {
  id: NetworkId;
  name: NetworkInfo;
}

export type Address = {
  networkId: NetworkId;
  address: string;
}

export type Networks = Record<NetworkId, NetworkInfo>;

export type IdentityNo = number | null;

export type IdentityRecord = {
  nickName: null | string;
  identityNo: number;
}