import type BN from 'bn.js';

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type NetworkInfo = {
	name: string,
	ss58Prefix: (number | string | BN)
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
	alreadyIdentityOwner = 'AlreadyIdentityOwner'
}

