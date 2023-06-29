import type {ReturnNumber} from "@727-ventures/typechain-types";
import type * as ReturnTypes from '../types-returns/identity';

export interface IdentityCreated {
	owner: ReturnTypes.AccountId;
	identityNo: number;
}

export interface AddressAdded {
	identityNo: number;
	network: number;
	address: Array<number>;
}

export interface AddressUpdated {
	identityNo: number;
	network: number;
	updatedAddress: Array<number>;
}

export interface AddressRemoved {
	identityNo: number;
	network: number;
}

export interface IdentityRemoved {
	identityNo: number;
}

export interface NetworkAdded {
	networkId: number;
	name: string;
	ss58Prefix: number;
}

export interface NetworkUpdated {
	networkId: number;
	name: string;
	ss58Prefix: number;
}

export interface NetworkRemoved {
	networkId: number;
}

export interface RecoveryAccountSet {
	identityNo: number;
	recoveryAccount: ReturnTypes.AccountId;
}

