import type BN from 'bn.js';

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

