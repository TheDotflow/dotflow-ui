/* This file is auto-generated */

import type { GasLimit } from '@727-ventures/typechain-types';
import { buildSubmittableExtrinsic } from '@727-ventures/typechain-types';
import type { ApiPromise } from '@polkadot/api';
import type { ContractPromise } from '@polkadot/api-contract';
import type BN from 'bn.js';

import type * as ArgumentTypes from '../types-arguments/address_book';



export default class Methods {
	private __nativeContract: ContractPromise;
	private __apiPromise: ApiPromise;

	constructor(
		nativeContract: ContractPromise,
		apiPromise: ApiPromise,
	) {
		this.__nativeContract = nativeContract;
		this.__apiPromise = apiPromise;
	}
	/**
	 * identityContract
	 *
	*/
	"identityContract"(
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "identityContract", [], __options);
	}

	/**
	 * createAddressBook
	 *
	*/
	"createAddressBook"(
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "createAddressBook", [], __options);
	}

	/**
	 * removeAddressBook
	 *
	*/
	"removeAddressBook"(
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "removeAddressBook", [], __options);
	}

	/**
	 * addIdentity
	 *
	 * @param { (number | string | BN) } identityNo,
	 * @param { string | null } nickname,
	*/
	"addIdentity"(
		identityNo: (number | string | BN),
		nickname: string | null,
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "addIdentity", [identityNo, nickname], __options);
	}

	/**
	 * removeIdentity
	 *
	 * @param { (number | string | BN) } identityNo,
	*/
	"removeIdentity"(
		identityNo: (number | string | BN),
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "removeIdentity", [identityNo], __options);
	}

	/**
	 * updateNickname
	 *
	 * @param { (number | string | BN) } identityNo,
	 * @param { string | null } newNickname,
	*/
	"updateNickname"(
		identityNo: (number | string | BN),
		newNickname: string | null,
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "updateNickname", [identityNo, newNickname], __options);
	}

	/**
	 * identitiesOf
	 *
	 * @param { ArgumentTypes.AccountId } account,
	*/
	"identitiesOf"(
		account: ArgumentTypes.AccountId,
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "identitiesOf", [account], __options);
	}

	/**
	 * hasAddressBook
	 *
	*/
	"hasAddressBook"(
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "hasAddressBook", [], __options);
	}

}