import { KeyringPair } from "@polkadot/keyring/types";

import { AccountType } from "../../../types/types-arguments/identity";

export type AccountIdRaw = Uint8Array;
export type NetworkId = number;

export type Sender = {
  keypair: KeyringPair;
  chain: NetworkId;
}

export type Receiver = {
  addressRaw: AccountIdRaw;
  type: AccountType;
  chain: NetworkId;
}

export type Fungible = {
  multiAsset: any,
  amount: number
}
