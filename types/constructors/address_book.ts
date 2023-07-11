import type { ConstructorOptions } from '@727-ventures/typechain-types';
import {
	_genValidGasLimitAndValue,
	_signAndSend,
	SignAndSendSuccessResponse,
} from '@727-ventures/typechain-types';
import type { ApiPromise } from '@polkadot/api';
import { CodePromise } from '@polkadot/api-contract';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { WeightV2 } from '@polkadot/types/interfaces';

import { ContractFile } from '../contract-info/address_book';
import type * as ArgumentTypes from '../types-arguments/address_book';

export default class Constructors {
	readonly nativeAPI: ApiPromise;
	readonly signer: KeyringPair;

	constructor(nativeAPI: ApiPromise, signer: KeyringPair) {
		this.nativeAPI = nativeAPI;
		this.signer = signer;
	}

	/**
	 * new
	 *
	 * @param { ArgumentTypes.AccountId } identityContract,
	 */
	async new(
		identityContract: ArgumentTypes.AccountId,
		__options?: ConstructorOptions
	) {
		const __contract = JSON.parse(ContractFile);
		const code = new CodePromise(
			this.nativeAPI,
			__contract,
			__contract.source.wasm
		);
		const gasLimit = (
			await _genValidGasLimitAndValue(this.nativeAPI, __options)
		).gasLimit as WeightV2;

		const storageDepositLimit = __options?.storageDepositLimit;
		const tx = code.tx['new']!(
			{ gasLimit, storageDepositLimit, value: __options?.value },
			identityContract
		);
		let response;

		try {
			response = await _signAndSend(
				this.nativeAPI.registry,
				tx,
				this.signer,
				(event: any) => event
			);
		} catch (error) {
			// eslint-disable-next-line no-console
			console.log(error);
		}

		return {
			result: response as SignAndSendSuccessResponse,
			address:
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				(response as SignAndSendSuccessResponse)!.result!.contract.address.toString(),
		};
	}
}
