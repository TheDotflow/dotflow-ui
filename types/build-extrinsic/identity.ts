/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { GasLimit, GasLimitAndRequiredValue } from '@727-ventures/typechain-types';
import { buildSubmittableExtrinsic } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/identity';
import type BN from 'bn.js';
import type { ApiPromise } from '@polkadot/api';



export default class Methods {
	private __nativeContract : ContractPromise;
	private __apiPromise: ApiPromise;

	constructor(
		nativeContract : ContractPromise,
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
	"identity" (
		identityNo: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "identity", [identityNo], __options);
	}

	/**
	 * ownerOf
	 *
	 * @param { (number | string | BN) } identityNo,
	*/
	"ownerOf" (
		identityNo: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "ownerOf", [identityNo], __options);
	}

	/**
	 * identityOf
	 *
	 * @param { ArgumentTypes.AccountId } owner,
	*/
	"identityOf" (
		owner: ArgumentTypes.AccountId,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "identityOf", [owner], __options);
	}

	/**
	 * chainInfoOf
	 *
	 * @param { (number | string | BN) } chainId,
	*/
	"chainInfoOf" (
		chainId: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "chainInfoOf", [chainId], __options);
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
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "transactionDestination", [receiver, chain], __options);
	}

	/**
	 * availableChains
	 *
	*/
	"availableChains" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "availableChains", [], __options);
	}

	/**
	 * createIdentity
	 *
	*/
	"createIdentity" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "createIdentity", [], __options);
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
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "addAddress", [chain, address], __options);
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
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "updateAddress", [chain, address], __options);
	}

	/**
	 * removeAddress
	 *
	 * @param { (number | string | BN) } chain,
	*/
	"removeAddress" (
		chain: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "removeAddress", [chain], __options);
	}

	/**
	 * removeIdentity
	 *
	*/
	"removeIdentity" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "removeIdentity", [], __options);
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
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "addChain", [chainId, info], __options);
	}

	/**
	 * updateChain
	 *
	 * @param { (number | string | BN) } chainId,
	 * @param { string | null } newRpcUrl,
	 * @param { ArgumentTypes.AccountType | null } newAddressType,
	*/
	"updateChain" (
		chainId: (number | string | BN),
		newRpcUrl: string | null,
		newAddressType: ArgumentTypes.AccountType | null,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "updateChain", [chainId, newRpcUrl, newAddressType], __options);
	}

	/**
	 * removeChain
	 *
	 * @param { (number | string | BN) } chainId,
	*/
	"removeChain" (
		chainId: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "removeChain", [chainId], __options);
	}

	/**
	 * setRecoveryAccount
	 *
	 * @param { ArgumentTypes.AccountId } recoveryAccount,
	*/
	"setRecoveryAccount" (
		recoveryAccount: ArgumentTypes.AccountId,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "setRecoveryAccount", [recoveryAccount], __options);
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
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "transferOwnership", [identityNo, newOwner], __options);
	}

}