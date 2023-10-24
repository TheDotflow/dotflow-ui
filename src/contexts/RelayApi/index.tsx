import { ApiPromise, WsProvider } from '@polkadot/api';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { DefinitionRpcExt } from '@polkadot/types/types';
import React, { useContext, useEffect, useReducer, useState } from 'react';

import { getRelayChainApiURL } from '@/consts';

import { useToast } from '../Toast';

///
// Initial state for `useReducer`

type State = {
  jsonrpc: Record<string, Record<string, DefinitionRpcExt>>;
  api: any;
  apiError: any;
  apiState: any;
};

const initialState: State = {
  // These are the states
  jsonrpc: { ...jsonrpc },
  api: null,
  apiError: null,
  apiState: null,
};

///
// Reducer function for `useReducer`

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: 'CONNECT_INIT' };
    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' };
    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' };
    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload };
    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

///
// Connecting to the Substrate node

const connect = (state: any, socket: string, force: boolean, dispatch: any) => {
  const { apiState, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState && !force) return;

  dispatch({ type: 'CONNECT_INIT' });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then(() => dispatch({ type: 'CONNECT_SUCCESS' }));
  });
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }));
  _api.on('error', (err) => dispatch({ type: 'CONNECT_ERROR', payload: err }));
};

const defaultValue = {
  state: initialState,
};

type Relay = {
  relay: "polkadot" | "kusama",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setRelay(_value: string): void
}

const DEFAULT_RELAY = "kusama";

const RelayContext = React.createContext(
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  { relay: "polkadot", setRelay: (_value: string) => { } } as Relay
);

const RelayContextProvider = (props: any) => {
  const [relay, setRelay]: [relay: "polkadot" | "kusama", setRelay: any] = useState(DEFAULT_RELAY);

  return (
    <RelayContext.Provider value={{ relay: relay, setRelay: setRelay }}>
      {props.children}
    </RelayContext.Provider>
  );
}

const useRelay = () => useContext(RelayContext);

const RelayApiContext = React.createContext(defaultValue);

const RelayApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [prevRelay, setPrevRelay] = useState(DEFAULT_RELAY);
  const { toastError, toastSuccess } = useToast();
  const { relay } = useRelay();

  useEffect(() => {
    state.apiError &&
      toastError(
        `Failed to connect to relay chain: error = ${state.apiError.toString()}`
      );
  }, [state.apiError]);

  useEffect(() => {
    state.apiState === 'READY' &&
      toastSuccess('Successfully connected to relay chain');
  }, [state.apiState]);

  useEffect(() => {
    const force = prevRelay !== relay;
    setPrevRelay(relay);
    connect(state, getRelayChainApiURL(relay), force, dispatch);
  }, [relay]);

  return (
    <RelayApiContext.Provider value={{ state }}>
      {props.children}
    </RelayApiContext.Provider>
  );
};

const useRelayApi = () => useContext(RelayApiContext);

export { RelayApiContextProvider, RelayContextProvider, useRelay, useRelayApi };
