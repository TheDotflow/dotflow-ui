import type {ReturnNumber} from "@727-ventures/typechain-types";
import type * as ReturnTypes from '../types-returns/address_book';

export interface AddressBookCreated {
	owner: ReturnTypes.AccountId;
}

export interface AddressBookRemoved {
	owner: ReturnTypes.AccountId;
}

export interface IdentityAdded {
	owner: ReturnTypes.AccountId;
	identity: number;
}

export interface NicknameUpdated {
	owner: ReturnTypes.AccountId;
	identity: number;
	newNickname: string | null;
}

export interface IdentityRemoved {
	owner: ReturnTypes.AccountId;
	identity: number;
}

