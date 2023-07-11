/* This file is auto-generated */

import type { GasLimit } from '@727-ventures/typechain-types';
import { txSignAndSend } from '@727-ventures/typechain-types';
import type { ApiPromise } from '@polkadot/api';
import type { ContractPromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import { EventRecord } from '@polkadot/types/interfaces';
import type BN from 'bn.js';

import EVENT_DATA_TYPE_DESCRIPTIONS from '../event-data/address_book.json';
import { decodeEvents } from "../shared/utils";
import type * as ArgumentTypes from '../types-arguments/address_book';


export default class Methods {
	private __nativeContract: ContractPromise;
	private __keyringPair: KeyringPair;
	private __apiPromise: ApiPromise;

	constructor(
		apiPromise: ApiPromise,
		nativeContract: ContractPromise,
		keyringPair: KeyringPair,
	) {
		this.__apiPromise = apiPromise;
		this.__nativeContract = nativeContract;
		this.__keyringPair = keyringPair;
	}

	/**
	* identityContract
	*
	*/
	"identityContract"(
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "identityContract", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* createAddressBook
	*
	*/
	"createAddressBook"(
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "createAddressBook", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* removeAddressBook
	*
	*/
	"removeAddressBook"(
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeAddressBook", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
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
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "addIdentity", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo, nickname], __options);
	}

	/**
	* removeIdentity
	*
	* @param { (number | string | BN) } identityNo,
	*/
	"removeIdentity"(
		identityNo: (number | string | BN),
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeIdentity", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo], __options);
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
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateNickname", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo, newNickname], __options);
	}

	/**
	* identitiesOf
	*
	* @param { ArgumentTypes.AccountId } account,
	*/
	"identitiesOf"(
		account: ArgumentTypes.AccountId,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "identitiesOf", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [account], __options);
	}

	/**
	* hasAddressBook
	*
	*/
	"hasAddressBook"(
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "hasAddressBook", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

}