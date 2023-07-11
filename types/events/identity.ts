import { handleEventReturn } from "@727-ventures/typechain-types";
import type { ApiPromise } from "@polkadot/api";
import type { ContractPromise } from "@polkadot/api-contract";

import EVENT_DATA_TYPE_DESCRIPTIONS from '../event-data/identity.json';
import type * as EventTypes from '../event-types/identity';
import { getEventTypeDescription } from "../shared/utils";

export default class EventsClass {
	private __nativeContract: ContractPromise;
	private __api: ApiPromise;

	constructor(
		nativeContract: ContractPromise,
		api: ApiPromise,
	) {
		this.__nativeContract = nativeContract;
		this.__api = api;
	}

	public subscribeOnIdentityCreatedEvent(callback: (_event: EventTypes.IdentityCreated) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('IdentityCreated', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.IdentityCreated);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'IdentityCreated');
	}

	public subscribeOnAddressAddedEvent(callback: (_event: EventTypes.AddressAdded) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('AddressAdded', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.AddressAdded);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'AddressAdded');
	}

	public subscribeOnAddressUpdatedEvent(callback: (_event: EventTypes.AddressUpdated) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('AddressUpdated', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.AddressUpdated);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'AddressUpdated');
	}

	public subscribeOnAddressRemovedEvent(callback: (_event: EventTypes.AddressRemoved) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('AddressRemoved', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.AddressRemoved);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'AddressRemoved');
	}

	public subscribeOnIdentityRemovedEvent(callback: (_event: EventTypes.IdentityRemoved) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('IdentityRemoved', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.IdentityRemoved);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'IdentityRemoved');
	}

	public subscribeOnNetworkAddedEvent(callback: (_event: EventTypes.NetworkAdded) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('NetworkAdded', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.NetworkAdded);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'NetworkAdded');
	}

	public subscribeOnNetworkUpdatedEvent(callback: (_event: EventTypes.NetworkUpdated) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('NetworkUpdated', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.NetworkUpdated);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'NetworkUpdated');
	}

	public subscribeOnNetworkRemovedEvent(callback: (_event: EventTypes.NetworkRemoved) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('NetworkRemoved', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.NetworkRemoved);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'NetworkRemoved');
	}

	public subscribeOnRecoveryAccountSetEvent(callback: (_event: EventTypes.RecoveryAccountSet) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('RecoveryAccountSet', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.RecoveryAccountSet);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'RecoveryAccountSet');
	}


	private __subscribeOnEvent(
		callback: (_args: any[], _event: any) => void,
		filter: (_eventName: string) => boolean = () => true
	) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.__api.query.system.events((events) => {
			events.forEach((record: any) => {
				const { event } = record;

				if (event.method == 'ContractEmitted') {
					const [address, data] = record.event.data;

					if (address.toString() === this.__nativeContract.address.toString()) {
						const { args, event } = this.__nativeContract.abi.decodeEvent(data);

						if (filter(event.identifier.toString()))
							callback(args, event);
					}
				}
			});
		});
	}

}