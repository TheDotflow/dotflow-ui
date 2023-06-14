export type NetworkId = number;
export type NetworkName = string;

export type Network = {
  id: NetworkId;
  name: NetworkName;
}

export type Networks = Record<NetworkId, NetworkName>;

export type IdentityNo = number | null;