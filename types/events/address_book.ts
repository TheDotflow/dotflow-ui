import { handleEventReturn } from "@727-ventures/typechain-types";
import type { ApiPromise } from "@polkadot/api";
import type { ContractPromise } from "@polkadot/api-contract";

import EVENT_DATA_TYPE_DESCRIPTIONS from '../event-data/address_book.json';
import type * as EventTypes from '../event-types/address_book';
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

	public subscribeOnAddressBookCreatedEvent(callback: (_event: EventTypes.AddressBookCreated) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('AddressBookCreated', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.AddressBookCreated);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'AddressBookCreated');
	}

	public subscribeOnAddressBookRemovedEvent(callback: (_event: EventTypes.AddressBookRemoved) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('AddressBookRemoved', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.AddressBookRemoved);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'AddressBookRemoved');
	}

	public subscribeOnIdentityAddedEvent(callback: (_event: EventTypes.IdentityAdded) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('IdentityAdded', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.IdentityAdded);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'IdentityAdded');
	}

	public subscribeOnNickNameUpdatedEvent(callback: (_event: EventTypes.NickNameUpdated) => void) {
		const callbackWrapper = (args: any[], event: any) => {
			const _event: Record<string, any> = {};

			for (let i = 0; i < args.length; i++) {
				_event[event.args[i]!.name] = args[i]!.toJSON();
			}

			callback(handleEventReturn(_event, getEventTypeDescription('NickNameUpdated', EVENT_DATA_TYPE_DESCRIPTIONS)) as EventTypes.NickNameUpdated);
		};

		return this.__subscribeOnEvent(callbackWrapper, (eventName: string) => eventName == 'NickNameUpdated');
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