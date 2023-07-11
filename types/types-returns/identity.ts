/* eslint-disable no-unused-vars */

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
	addresses: Array<[number, Array<number>]>
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

