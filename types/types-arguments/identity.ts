import type BN from 'bn.js';

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type NetworkInfo = {
	rpcUrl: string,
	accountType: AccountType
}

export enum AccountType {
	accountId32 = 'AccountId32',
	accountKey20 = 'AccountKey20'
}

export type IdentityInfo = {
	addresses: Array<[(number | string | BN), Array<(number | string | BN)>]>
}

export enum Error {
	notAllowed = 'NotAllowed',
	identityDoesntExist = 'IdentityDoesntExist',
	addressAlreadyAdded = 'AddressAlreadyAdded',
	invalidNetwork = 'InvalidNetwork',
	addressSizeExceeded = 'AddressSizeExceeded',
	networkNameTooLong = 'NetworkNameTooLong',
	networkRpcUrlTooLong = 'NetworkRpcUrlTooLong',
	alreadyIdentityOwner = 'AlreadyIdentityOwner'
}

