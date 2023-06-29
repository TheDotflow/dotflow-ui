import type BN from 'bn.js';
import type {ReturnNumber} from '@727-ventures/typechain-types';

export type AccountId = string | number[]

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type NetworkInfo = {
	name: string,
	ss58Prefix: number
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
	alreadyIdentityOwner = 'AlreadyIdentityOwner'
}

