/* This file is auto-generated */

import type { GasLimit, Result } from '@727-ventures/typechain-types';
import type { QueryReturnType } from '@727-ventures/typechain-types';
import { handleReturnType, queryOkJSON } from '@727-ventures/typechain-types';
import { txSignAndSend } from '@727-ventures/typechain-types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import type { ApiPromise } from '@polkadot/api';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import type { EventRecord } from "@polkadot/api/submittable";
import type { ContractPromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import type BN from 'bn.js';

import { getTypeDescription } from './../shared/utils';
import DATA_TYPE_DESCRIPTIONS from '../data/address_book.json';
import EVENT_DATA_TYPE_DESCRIPTIONS from '../event-data/address_book.json';
import { decodeEvents } from "../shared/utils";
import type * as ArgumentTypes from '../types-arguments/address_book';
import type * as ReturnTypes from '../types-returns/address_book';


export default class Methods {
	private __nativeContract: ContractPromise;
	private __keyringPair: KeyringPair;
	private __callerAddress: string;
	private __apiPromise: ApiPromise;

	constructor(
		apiPromise: ApiPromise,
		nativeContract: ContractPromise,
		keyringPair: KeyringPair,
	) {
		this.__apiPromise = apiPromise;
		this.__nativeContract = nativeContract;
		this.__keyringPair = keyringPair;
		this.__callerAddress = keyringPair.address;
	}

	/**
	* identityContract
	*
	* @returns { Result<ReturnTypes.AccountId, ReturnTypes.LangError> }
	*/
	"identityContract"(
		__options: GasLimit,
	): Promise<QueryReturnType<Result<ReturnTypes.AccountId, ReturnTypes.LangError>>> {
		return queryOkJSON(this.__apiPromise, this.__nativeContract, this.__callerAddress, "identityContract", [], __options, (result) => { return handleReturnType(result, getTypeDescription(11, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* createAddressBook
	*
	* @returns { void }
	*/
	"createAddressBook"(
		__options: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "createAddressBook", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* removeAddressBook
	*
	* @returns { void }
	*/
	"removeAddressBook"(
		__options: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeAddressBook", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* addIdentity
	*
	* @param { (number | string | BN) } identityNo,
	* @param { string | null } nickname,
	* @returns { void }
	*/
	"addIdentity"(
		identityNo: (number | string | BN),
		nickname: string | null,
		__options: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "addIdentity", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo, nickname], __options);
	}

	/**
	* removeIdentity
	*
	* @param { (number | string | BN) } identityNo,
	* @returns { void }
	*/
	"removeIdentity"(
		identityNo: (number | string | BN),
		__options: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeIdentity", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo], __options);
	}

	/**
	* updateNickname
	*
	* @param { (number | string | BN) } identityNo,
	* @param { string | null } newNickname,
	* @returns { void }
	*/
	"updateNickname"(
		identityNo: (number | string | BN),
		newNickname: string | null,
		__options: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateNickname", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo, newNickname], __options);
	}

	/**
	* identitiesOf
	*
	* @param { ArgumentTypes.AccountId } account,
	* @returns { Result<Array<[number, string | null]>, ReturnTypes.LangError> }
	*/
	"identitiesOf"(
		account: ArgumentTypes.AccountId,
		__options: GasLimit,
	): Promise<QueryReturnType<Result<Array<[number, string | null]>, ReturnTypes.LangError>>> {
		return queryOkJSON(this.__apiPromise, this.__nativeContract, this.__callerAddress, "identitiesOf", [account], __options, (result) => { return handleReturnType(result, getTypeDescription(15, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* hasAddressBook
	*
	* @returns { Result<boolean, ReturnTypes.LangError> }
	*/
	"hasAddressBook"(
		__options: GasLimit,
	): Promise<QueryReturnType<Result<boolean, ReturnTypes.LangError>>> {
		return queryOkJSON(this.__apiPromise, this.__nativeContract, this.__callerAddress, "hasAddressBook", [], __options, (result) => { return handleReturnType(result, getTypeDescription(16, DATA_TYPE_DESCRIPTIONS)); });
	}

}