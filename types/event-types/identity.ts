import type {ReturnNumber} from "@727-ventures/typechain-types";
import type * as ReturnTypes from '../types-returns/identity';

export interface IdentityCreated {
	owner: ReturnTypes.AccountId;
	identityNo: number;
}

export interface AddressAdded {
	identityNo: number;
	chain: number;
	address: Array<number>;
}

export interface AddressUpdated {
	identityNo: number;
	chain: number;
	updatedAddress: Array<number>;
}

export interface AddressRemoved {
	identityNo: number;
	chain: number;
}

export interface IdentityRemoved {
	identityNo: number;
}

export interface ChainAdded {
	chainId: number;
	rpcUrls: Array<string>;
	accountType: ReturnTypes.AccountType;
}

export interface ChainUpdated {
	chainId: number;
	rpcUrls: Array<string>;
	accountType: ReturnTypes.AccountType;
}

export interface ChainRemoved {
	chainId: number;
}

export interface RecoveryAccountSet {
	identityNo: number;
	recoveryAccount: ReturnTypes.AccountId;
}

