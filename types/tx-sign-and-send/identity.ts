/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { ApiPromise } from '@polkadot/api';
import type { GasLimit, GasLimitAndRequiredValue, Result } from '@727-ventures/typechain-types';
import { txSignAndSend } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/identity';
import type BN from 'bn.js';
// @ts-ignore
import type {EventRecord} from "@polkadot/api/submittable";
import {decodeEvents} from "../shared/utils";
import EVENT_DATA_TYPE_DESCRIPTIONS from '../event-data/identity.json';


export default class Methods {
	private __nativeContract : ContractPromise;
	private __keyringPair : KeyringPair;
	private __apiPromise: ApiPromise;

	constructor(
		apiPromise: ApiPromise,
		nativeContract : ContractPromise,
		keyringPair : KeyringPair,
	) {
		this.__apiPromise = apiPromise;
		this.__nativeContract = nativeContract;
		this.__keyringPair = keyringPair;
	}

	/**
	* identity
	*
	* @param { (number | string | BN) } identityNo,
	*/
	"identity" (
		identityNo: (number | string | BN),
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "identity", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo], __options);
	}

	/**
	* ownerOf
	*
	* @param { (number | string | BN) } identityNo,
	*/
	"ownerOf" (
		identityNo: (number | string | BN),
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "ownerOf", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo], __options);
	}

	/**
	* identityOf
	*
	* @param { ArgumentTypes.AccountId } owner,
	*/
	"identityOf" (
		owner: ArgumentTypes.AccountId,
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "identityOf", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [owner], __options);
	}

	/**
	* chainInfoOf
	*
	* @param { (number | string | BN) } chainId,
	*/
	"chainInfoOf" (
		chainId: (number | string | BN),
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "chainInfoOf", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chainId], __options);
	}

	/**
	* transactionDestination
	*
	* @param { (number | string | BN) } receiver,
	* @param { (number | string | BN) } chain,
	*/
	"transactionDestination" (
		receiver: (number | string | BN),
		chain: (number | string | BN),
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "transactionDestination", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [receiver, chain], __options);
	}

	/**
	* availableChains
	*
	*/
	"availableChains" (
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "availableChains", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* createIdentity
	*
	*/
	"createIdentity" (
		__options ? : GasLimit,
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
	*/
	"addAddress" (
		chain: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options ? : GasLimit,
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
	*/
	"updateAddress" (
		chain: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateAddress", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chain, address], __options);
	}

	/**
	* removeAddress
	*
	* @param { (number | string | BN) } chain,
	*/
	"removeAddress" (
		chain: (number | string | BN),
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeAddress", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chain], __options);
	}

	/**
	* removeIdentity
	*
	*/
	"removeIdentity" (
		__options ? : GasLimit,
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
	*/
	"addChain" (
		chainId: (number | string | BN),
		info: ArgumentTypes.ChainInfo,
		__options ? : GasLimit,
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
	*/
	"updateChain" (
		chainId: (number | string | BN),
		newAddressType: ArgumentTypes.AccountType | null,
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateChain", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chainId, newAddressType], __options);
	}

	/**
	* removeChain
	*
	* @param { (number | string | BN) } chainId,
	*/
	"removeChain" (
		chainId: (number | string | BN),
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeChain", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [chainId], __options);
	}

	/**
	* setRecoveryAccount
	*
	* @param { ArgumentTypes.AccountId } recoveryAccount,
	*/
	"setRecoveryAccount" (
		recoveryAccount: ArgumentTypes.AccountId,
		__options ? : GasLimit,
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
	*/
	"transferOwnership" (
		identityNo: (number | string | BN),
		newOwner: ArgumentTypes.AccountId,
		__options ? : GasLimit,
	){
		return txSignAndSend( this.__apiPromise, this.__nativeContract, this.__keyringPair, "transferOwnership", (events: EventRecord) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo, newOwner], __options);
	}

}