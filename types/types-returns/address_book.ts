import type BN from 'bn.js';
import type {ReturnNumber} from '@727-ventures/typechain-types';

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export enum Error {
	addressBookAlreadyCreated = 'AddressBookAlreadyCreated',
	addressBookDoesntExist = 'AddressBookDoesntExist',
	identityDoesntExist = 'IdentityDoesntExist',
	identityNotAdded = 'IdentityNotAdded',
	identityAlreadyAdded = 'IdentityAlreadyAdded',
	nickNameTooLong = 'NickNameTooLong'
}

