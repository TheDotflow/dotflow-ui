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

export enum FeePayment {
  // Pay with the asset you are transfering.
  //
  // NOTE: the asset has to be sufficient to be able to pay for fees.
  Asset,
  // Pay with the relay chain token.
  //
  // The relay chain native token is usually allowed for fee payment on parachains.
  RelayChainNative,
}
