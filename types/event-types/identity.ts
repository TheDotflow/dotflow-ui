import type {ReturnNumber} from "@727-ventures/typechain-types";
import type * as ReturnTypes from '../types-returns/identity';

export interface IdentityCreated {
	owner: ReturnTypes.AccountId;
	identityNo: number;
}

export interface AddressAdded {
	identityNo: number;
	chain: [number, ReturnTypes.Network];
	address: Array<number>;
}

export interface AddressUpdated {
	identityNo: number;
	chain: [number, ReturnTypes.Network];
	updatedAddress: Array<number>;
}

export interface AddressRemoved {
	identityNo: number;
	chain: [number, ReturnTypes.Network];
}

export interface IdentityRemoved {
	identityNo: number;
}

export interface ChainAdded {
	chainId: [number, ReturnTypes.Network];
	accountType: ReturnTypes.AccountType;
}

export interface ChainUpdated {
	chainId: [number, ReturnTypes.Network];
	accountType: ReturnTypes.AccountType;
}

export interface ChainRemoved {
	chainId: [number, ReturnTypes.Network];
}

export interface RecoveryAccountSet {
	identityNo: number;
	recoveryAccount: ReturnTypes.AccountId;
}

