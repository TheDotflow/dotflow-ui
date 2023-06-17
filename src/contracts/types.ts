export type NetworkId = number;

export type NetworkInfo = {
  name: string;
  ss58Prefix: number;
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
