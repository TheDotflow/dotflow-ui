import { isHex } from "@polkadot/util";
import { validateAddress } from '@polkadot/util-crypto';

export const clipAddress = (val: string) => {
  if (typeof val !== 'string') {
    return val;
  }
  return `${val.substring(0, 6)}...${val.substring(
    val.length - 6,
    val.length
  )}`;
};

export const isValidAddress = (networkAddress: string, ss58Prefix: number) => {
  if (isHex(networkAddress)) return false;
  try {
    validateAddress(networkAddress, true, ss58Prefix);
    return true;
  } catch {
    return false;
  }
};