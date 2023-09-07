/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { ApiPromise } from '@polkadot/api';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { GasLimit, GasLimitAndRequiredValue, Result } from '@727-ventures/typechain-types';
import type { QueryReturnType } from '@727-ventures/typechain-types';
import { queryOkJSON, queryJSON, handleReturnType } from '@727-ventures/typechain-types';
import { txSignAndSend } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/identity';
import type * as ReturnTypes from '../types-returns/identity';
import type BN from 'bn.js';
//@ts-ignore
import {ReturnNumber} from '@727-ventures/typechain-types';
import {getTypeDescription} from './../shared/utils';
// @ts-ignore
import type {EventRecord} from "@polkadot/api/submittable";
import {decodeEvents} from "../shared/utils";
import DATA_TYPE_DESCRIPTIONS from '../data/identity.json';
import EVENT_DATA_TYPE_DESCRIPTIONS from '../event-data/identity.json';


export default class Methods {
	private __nativeContract : ContractPromise;
	private __keyringPair : KeyringPair;
	private __callerAddress : string;
	private __apiPromise: ApiPromise;

	constructor(
		apiPromise : ApiPromise,
		nativeContract : ContractPromise,
		keyringPair : KeyringPair,
	) {
		this.__apiPromise = apiPromise;
		this.__nativeContract = nativeContract;
		this.__keyringPair = keyringPair;
		this.__callerAddress = keyringPair.address;
	}

	/**
	* identity
	*
	* @param { (number | string | BN) } identityNo,
	* @returns { Result<ReturnTypes.IdentityInfo | null, ReturnTypes.LangError> }
	*/
	"identity" (
		identityNo: (number | string | BN),
		__options: GasLimit,
	): Promise< QueryReturnType< Result<ReturnTypes.IdentityInfo | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "identity", [identityNo], __options, (result) => { return handleReturnType(result, getTypeDescription(14, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* ownerOf
	*
	* @param { (number | string | BN) } identityNo,
	* @returns { Result<ReturnTypes.AccountId | null, ReturnTypes.LangError> }
	*/
	"ownerOf" (
		identityNo: (number | string | BN),
		__options: GasLimit,
	): Promise< QueryReturnType< Result<ReturnTypes.AccountId | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "ownerOf", [identityNo], __options, (result) => { return handleReturnType(result, getTypeDescription(17, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* identityOf
	*
	* @param { ArgumentTypes.AccountId } owner,
	* @returns { Result<number | null, ReturnTypes.LangError> }
	*/
	"identityOf" (
		owner: ArgumentTypes.AccountId,
		__options: GasLimit,
	): Promise< QueryReturnType< Result<number | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "identityOf", [owner], __options, (result) => { return handleReturnType(result, getTypeDescription(19, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* chainInfoOf
	*
	* @param { (number | string | BN) } chainId,
	* @returns { Result<ReturnTypes.ChainInfo | null, ReturnTypes.LangError> }
	*/
	"chainInfoOf" (
		chainId: (number | string | BN),
		__options: GasLimit,
	): Promise< QueryReturnType< Result<ReturnTypes.ChainInfo | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "chainInfoOf", [chainId], __options, (result) => { return handleReturnType(result, getTypeDescription(21, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* transactionDestination
	*
	* @param { (number | string | BN) } receiver,
	* @param { (number | string | BN) } chain,
	* @returns { Result<Result<Array<number>, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"transactionDestination" (
		receiver: (number | string | BN),
		chain: (number | string | BN),
		__options: GasLimit,
	): Promise< QueryReturnType< Result<Result<Array<number>, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "transactionDestination", [receiver, chain], __options, (result) => { return handleReturnType(result, getTypeDescription(23, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* availableChains
	*
	* @returns { Result<Array<[number, ReturnTypes.ChainInfo]>, ReturnTypes.LangError> }
	*/
	"availableChains" (
		__options: GasLimit,
	): Promise< QueryReturnType< Result<Array<[number, ReturnTypes.ChainInfo]>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "availableChains", [], __options, (result) => { return handleReturnType(result, getTypeDescription(26, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* createIdentity
	*
	* @returns { void }
	*/
	"createIdentity" (
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "createIdentity", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* addAddress
	*
	* @param { (number | string | BN) } chain,
	* @param { Array<(number | string | BN)> } address,
	* @returns { void }
	*/
	"addAddress" (
		chain: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "addAddress", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chain, address], __options);
	}

	/**
	* updateAddress
	*
	* @param { (number | string | BN) } chain,
	* @param { Array<(number | string | BN)> } address,
	* @returns { void }
	*/
	"updateAddress" (
		chain: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateAddress", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chain, address], __options);
	}

	/**
	* removeAddress
	*
	* @param { (number | string | BN) } chain,
	* @returns { void }
	*/
	"removeAddress" (
		chain: (number | string | BN),
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeAddress", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chain], __options);
	}

	/**
	* removeIdentity
	*
	* @returns { void }
	*/
	"removeIdentity" (
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeIdentity", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* addChain
	*
	* @param { (number | string | BN) } chainId,
	* @param { ArgumentTypes.ChainInfo } info,
	* @returns { void }
	*/
	"addChain" (
		chainId: (number | string | BN),
		info: ArgumentTypes.ChainInfo,
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "addChain", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chainId, info], __options);
	}

	/**
	* updateChain
	*
	* @param { (number | string | BN) } chainId,
	* @param { ArgumentTypes.AccountType | null } newAddressType,
	* @returns { void }
	*/
	"updateChain" (
		chainId: (number | string | BN),
		newAddressType: ArgumentTypes.AccountType | null,
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateChain", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chainId, newAddressType], __options);
	}

	/**
	* removeChain
	*
	* @param { (number | string | BN) } chainId,
	* @returns { void }
	*/
	"removeChain" (
		chainId: (number | string | BN),
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeChain", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chainId], __options);
	}

	/**
	* setRecoveryAccount
	*
	* @param { ArgumentTypes.AccountId } recoveryAccount,
	* @returns { void }
	*/
	"setRecoveryAccount" (
		recoveryAccount: ArgumentTypes.AccountId,
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "setRecoveryAccount", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [recoveryAccount], __options);
	}

	/**
	* transferOwnership
	*
	* @param { (number | string | BN) } identityNo,
	* @param { ArgumentTypes.AccountId } newOwner,
	* @returns { void }
	*/
	"transferOwnership" (
		identityNo: (number | string | BN),
		newOwner: ArgumentTypes.AccountId,
		__options: GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "transferOwnership", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo, newOwner], __options);
	}

}