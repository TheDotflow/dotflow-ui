/* This file is auto-generated */

import type { GasLimit } from '@727-ventures/typechain-types';
import { txSignAndSend } from '@727-ventures/typechain-types';
import type { ApiPromise } from '@polkadot/api';
import type { ContractPromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import { EventRecord } from '@polkadot/types/interfaces';
import type BN from 'bn.js';

import EVENT_DATA_TYPE_DESCRIPTIONS from '../event-data/identity.json';
import { decodeEvents } from "../shared/utils";
import type * as ArgumentTypes from '../types-arguments/identity';


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
	* identity
	*
	* @param { (number | string | BN) } identityNo,
	*/
	"identity"(
		identityNo: (number | string | BN),
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "identity", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo], __options);
	}

	/**
	* ownerOf
	*
	* @param { (number | string | BN) } identityNo,
	*/
	"ownerOf"(
		identityNo: (number | string | BN),
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "ownerOf", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo], __options);
	}

	/**
	* identityOf
	*
	* @param { ArgumentTypes.AccountId } owner,
	*/
	"identityOf"(
		owner: ArgumentTypes.AccountId,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "identityOf", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [owner], __options);
	}

	/**
	* networkInfoOf
	*
	* @param { (number | string | BN) } networkId,
	*/
	"networkInfoOf"(
		networkId: (number | string | BN),
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "networkInfoOf", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [networkId], __options);
	}

	/**
	* transactionDestination
	*
	* @param { (number | string | BN) } receiver,
	* @param { (number | string | BN) } network,
	*/
	"transactionDestination"(
		receiver: (number | string | BN),
		network: (number | string | BN),
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "transactionDestination", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [receiver, network], __options);
	}

	/**
	* availableNetworks
	*
	*/
	"availableNetworks"(
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "availableNetworks", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* createIdentity
	*
	*/
	"createIdentity"(
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "createIdentity", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* addAddress
	*
	* @param { (number | string | BN) } network,
	* @param { Array<(number | string | BN)> } address,
	*/
	"addAddress"(
		network: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "addAddress", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [network, address], __options);
	}

	/**
	* updateAddress
	*
	* @param { (number | string | BN) } network,
	* @param { Array<(number | string | BN)> } address,
	*/
	"updateAddress"(
		network: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateAddress", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [network, address], __options);
	}

	/**
	* removeAddress
	*
	* @param { (number | string | BN) } network,
	*/
	"removeAddress"(
		network: (number | string | BN),
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeAddress", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [network], __options);
	}

	/**
	* removeIdentity
	*
	*/
	"removeIdentity"(
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeIdentity", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [], __options);
	}

	/**
	* addNetwork
	*
	* @param { ArgumentTypes.NetworkInfo } info,
	*/
	"addNetwork"(
		info: ArgumentTypes.NetworkInfo,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "addNetwork", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [info], __options);
	}

	/**
	* updateNetwork
	*
	* @param { (number | string | BN) } networkId,
	* @param { string | null } newRpcUrl,
	* @param { ArgumentTypes.AccountType | null } newAddressType,
	*/
	"updateNetwork"(
		networkId: (number | string | BN),
		newRpcUrl: string | null,
		newAddressType: ArgumentTypes.AccountType | null,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "updateNetwork", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [networkId, newRpcUrl, newAddressType], __options);
	}

	/**
	* removeNetwork
	*
	* @param { (number | string | BN) } networkId,
	*/
	"removeNetwork"(
		networkId: (number | string | BN),
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "removeNetwork", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [networkId], __options);
	}

	/**
	* setRecoveryAccount
	*
	* @param { ArgumentTypes.AccountId } recoveryAccount,
	*/
	"setRecoveryAccount"(
		recoveryAccount: ArgumentTypes.AccountId,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "setRecoveryAccount", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [recoveryAccount], __options);
	}

	/**
	* transferOwnership
	*
	* @param { (number | string | BN) } identityNo,
	* @param { ArgumentTypes.AccountId } newOwner,
	*/
	"transferOwnership"(
		identityNo: (number | string | BN),
		newOwner: ArgumentTypes.AccountId,
		__options?: GasLimit,
	) {
		return txSignAndSend(this.__apiPromise, this.__nativeContract, this.__keyringPair, "transferOwnership", (events: EventRecord[]) => {
			return decodeEvents(events, this.__nativeContract, EVENT_DATA_TYPE_DESCRIPTIONS);
		}, [identityNo, newOwner], __options);
	}

}