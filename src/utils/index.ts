import { ApiPromise } from "@polkadot/api";
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

export const isValidAddress = (chainAddress: string, ss58Prefix: number) => {
  if (isHex(chainAddress)) return false;
  try {
    validateAddress(chainAddress, true, ss58Prefix);
    return true;
  } catch {
    return false;
  }
};

export const getParaId = async (api: ApiPromise): Promise<number> => {
  if (api.query.parachainInfo) {
    const response = (await api.query.parachainInfo.parachainId()).toJSON();
    return Number(response);
  } else {
    return 0;
  }
}
