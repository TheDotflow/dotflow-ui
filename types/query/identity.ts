/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { ApiPromise } from '@polkadot/api';
import type { GasLimit, GasLimitAndRequiredValue, Result } from '@727-ventures/typechain-types';
import type { QueryReturnType } from '@727-ventures/typechain-types';
import { queryJSON, queryOkJSON, handleReturnType } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/identity';
import type * as ReturnTypes from '../types-returns/identity';
import type BN from 'bn.js';
//@ts-ignore
import {ReturnNumber} from '@727-ventures/typechain-types';
import {getTypeDescription} from './../shared/utils';
import DATA_TYPE_DESCRIPTIONS from '../data/identity.json';


export default class Methods {
	private __nativeContract : ContractPromise;
	private __apiPromise: ApiPromise;
	private __callerAddress : string;

	constructor(
		nativeContract : ContractPromise,
		nativeApi : ApiPromise,
		callerAddress : string,
	) {
		this.__nativeContract = nativeContract;
		this.__callerAddress = callerAddress;
		this.__apiPromise = nativeApi;
	}

	/**
	* identity
	*
	* @param { (number | string | BN) } identityNo,
	* @returns { Result<ReturnTypes.IdentityInfo | null, ReturnTypes.LangError> }
	*/
	"identity" (
		identityNo: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<ReturnTypes.IdentityInfo | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "identity", [identityNo], __options , (result) => { return handleReturnType(result, getTypeDescription(14, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* ownerOf
	*
	* @param { (number | string | BN) } identityNo,
	* @returns { Result<ReturnTypes.AccountId | null, ReturnTypes.LangError> }
	*/
	"ownerOf" (
		identityNo: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<ReturnTypes.AccountId | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "ownerOf", [identityNo], __options , (result) => { return handleReturnType(result, getTypeDescription(17, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* identityOf
	*
	* @param { ArgumentTypes.AccountId } owner,
	* @returns { Result<number | null, ReturnTypes.LangError> }
	*/
	"identityOf" (
		owner: ArgumentTypes.AccountId,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<number | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "identityOf", [owner], __options , (result) => { return handleReturnType(result, getTypeDescription(19, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* networkInfoOf
	*
	* @param { (number | string | BN) } networkId,
	* @returns { Result<ReturnTypes.NetworkInfo | null, ReturnTypes.LangError> }
	*/
	"networkInfoOf" (
		networkId: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<ReturnTypes.NetworkInfo | null, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "networkInfoOf", [networkId], __options , (result) => { return handleReturnType(result, getTypeDescription(21, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* transactionDestination
	*
	* @param { (number | string | BN) } receiver,
	* @param { (number | string | BN) } network,
	* @returns { Result<Result<Array<number>, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"transactionDestination" (
		receiver: (number | string | BN),
		network: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<Array<number>, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "transactionDestination", [receiver, network], __options , (result) => { return handleReturnType(result, getTypeDescription(23, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* availableNetworks
	*
	* @returns { Result<Array<[number, ReturnTypes.NetworkInfo]>, ReturnTypes.LangError> }
	*/
	"availableNetworks" (
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Array<[number, ReturnTypes.NetworkInfo]>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "availableNetworks", [], __options , (result) => { return handleReturnType(result, getTypeDescription(26, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* createIdentity
	*
	* @returns { Result<Result<number, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"createIdentity" (
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<number, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "createIdentity", [], __options , (result) => { return handleReturnType(result, getTypeDescription(29, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* addAddress
	*
	* @param { (number | string | BN) } network,
	* @param { Array<(number | string | BN)> } address,
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"addAddress" (
		network: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "addAddress", [network, address], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* updateAddress
	*
	* @param { (number | string | BN) } network,
	* @param { Array<(number | string | BN)> } address,
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"updateAddress" (
		network: (number | string | BN),
		address: Array<(number | string | BN)>,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "updateAddress", [network, address], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* removeAddress
	*
	* @param { (number | string | BN) } network,
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"removeAddress" (
		network: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "removeAddress", [network], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* removeIdentity
	*
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"removeIdentity" (
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "removeIdentity", [], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* addNetwork
	*
	* @param { ArgumentTypes.NetworkInfo } info,
	* @returns { Result<Result<number, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"addNetwork" (
		info: ArgumentTypes.NetworkInfo,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<number, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "addNetwork", [info], __options , (result) => { return handleReturnType(result, getTypeDescription(29, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* updateNetwork
	*
	* @param { (number | string | BN) } networkId,
	* @param { string | null } newRpcUrl,
	* @param { ArgumentTypes.AccountType | null } newAddressType,
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"updateNetwork" (
		networkId: (number | string | BN),
		newRpcUrl: string | null,
		newAddressType: ArgumentTypes.AccountType | null,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "updateNetwork", [networkId, newRpcUrl, newAddressType], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* removeNetwork
	*
	* @param { (number | string | BN) } networkId,
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"removeNetwork" (
		networkId: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "removeNetwork", [networkId], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* setRecoveryAccount
	*
	* @param { ArgumentTypes.AccountId } recoveryAccount,
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"setRecoveryAccount" (
		recoveryAccount: ArgumentTypes.AccountId,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "setRecoveryAccount", [recoveryAccount], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* transferOwnership
	*
	* @param { (number | string | BN) } identityNo,
	* @param { ArgumentTypes.AccountId } newOwner,
	* @returns { Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> }
	*/
	"transferOwnership" (
		identityNo: (number | string | BN),
		newOwner: ArgumentTypes.AccountId,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, ReturnTypes.Error>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "transferOwnership", [identityNo, newOwner], __options , (result) => { return handleReturnType(result, getTypeDescription(31, DATA_TYPE_DESCRIPTIONS)); });
	}

}