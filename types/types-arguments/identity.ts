import type BN from 'bn.js';

export enum Network {
	polkadot = 'Polkadot',
	kusama = 'Kusama'
}

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type ChainInfo = {
	accountType: AccountType
}

export enum AccountType {
	accountId32 = 'AccountId32',
	accountKey20 = 'AccountKey20'
}

export type IdentityInfo = {
	addresses: Array<[[(number | string | BN), Network], Array<(number | string | BN)>]>
}

export enum Error {
	notAllowed = 'NotAllowed',
	identityDoesntExist = 'IdentityDoesntExist',
	addressAlreadyAdded = 'AddressAlreadyAdded',
	invalidChain = 'InvalidChain',
	addressSizeExceeded = 'AddressSizeExceeded',
	chainNameTooLong = 'ChainNameTooLong',
	alreadyIdentityOwner = 'AlreadyIdentityOwner'
}

