import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { AccountType } from "../../../types/types-arguments/identity";

export type AccountIdRaw = Uint8Array;
export type NetworkId = number;

export type Sender = {
  keypair: KeyringPair;
  network: NetworkId;
}

export type Receiver = {
  addressRaw: AccountIdRaw;
  type: AccountType;
  network: NetworkId;
}

export type Fungible = {
  multiAsset: any,
  amount: number
}
