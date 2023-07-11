/* This file is auto-generated */

import type { GasLimit } from '@727-ventures/typechain-types';
import { buildSubmittableExtrinsic } from '@727-ventures/typechain-types';
import type { ApiPromise } from '@polkadot/api';
import type { ContractPromise } from '@polkadot/api-contract';
import type BN from 'bn.js';

import type * as ArgumentTypes from '../types-arguments/identity';



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
	 * identity
	 *
	 * @param { (number | string | BN) } identityNo,
	*/
	"identity"(
		identityNo: (number | string | BN),
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "identity", [identityNo], __options);
	}

	/**
	 * ownerOf
	 *
	 * @param { (number | string | BN) } identityNo,
	*/
	"ownerOf"(
		identityNo: (number | string | BN),
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "ownerOf", [identityNo], __options);
	}

	/**
	 * identityOf
	 *
	 * @param { ArgumentTypes.AccountId } owner,
	*/
	"identityOf"(
		owner: ArgumentTypes.AccountId,
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "identityOf", [owner], __options);
	}

	/**
	 * networkInfoOf
	 *
	 * @param { (number | string | BN) } networkId,
	*/
	"networkInfoOf"(
		networkId: (number | string | BN),
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "networkInfoOf", [networkId], __options);
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
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "transactionDestination", [receiver, network], __options);
	}

	/**
	 * availableNetworks
	 *
	*/
	"availableNetworks"(
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "availableNetworks", [], __options);
	}

	/**
	 * createIdentity
	 *
	*/
	"createIdentity"(
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "createIdentity", [], __options);
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
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "addAddress", [network, address], __options);
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
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "updateAddress", [network, address], __options);
	}

	/**
	 * removeAddress
	 *
	 * @param { (number | string | BN) } network,
	*/
	"removeAddress"(
		network: (number | string | BN),
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "removeAddress", [network], __options);
	}

	/**
	 * removeIdentity
	 *
	*/
	"removeIdentity"(
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "removeIdentity", [], __options);
	}

	/**
	 * addNetwork
	 *
	 * @param { ArgumentTypes.NetworkInfo } info,
	*/
	"addNetwork"(
		info: ArgumentTypes.NetworkInfo,
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "addNetwork", [info], __options);
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
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "updateNetwork", [networkId, newRpcUrl, newAddressType], __options);
	}

	/**
	 * removeNetwork
	 *
	 * @param { (number | string | BN) } networkId,
	*/
	"removeNetwork"(
		networkId: (number | string | BN),
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "removeNetwork", [networkId], __options);
	}

	/**
	 * setRecoveryAccount
	 *
	 * @param { ArgumentTypes.AccountId } recoveryAccount,
	*/
	"setRecoveryAccount"(
		recoveryAccount: ArgumentTypes.AccountId,
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "setRecoveryAccount", [recoveryAccount], __options);
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
		__options: GasLimit,
	) {
		return buildSubmittableExtrinsic(this.__apiPromise, this.__nativeContract, "transferOwnership", [identityNo, newOwner], __options);
	}

}