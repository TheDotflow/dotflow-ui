import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";

import { AccountType } from "../../../types/types-arguments/identity";
import { IKeyringPair } from "@polkadot/types/types";

export type AccountIdRaw = Uint8Array;
export type ChainId = number;

export type Sender = {
  keypair: KeyringPair | IKeyringPair;
  chain: ChainId;
}

export type Receiver = {
  addressRaw: AccountIdRaw;
  type: AccountType;
  chain: ChainId;
}

export type Fungible = {
  multiAsset: any,
  amount: number
}

// All the rpc apis needed for all types of transfers.
export type TransferRpcApis = {
  originApi: ApiPromise,
  destApi: ApiPromise,
  reserveApi?: ApiPromise
}
