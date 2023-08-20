import { ApiPromise, WsProvider } from '@polkadot/api';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { DefinitionRpcExt } from '@polkadot/types/types';
import React, { useContext, useEffect, useReducer } from 'react';

import { RELAY_CHAIN_ENDPOINT } from '@/consts';

import { useToast } from '../Toast';

///
// Initial state for `useReducer`

type State = {
  socket: string;
  jsonrpc: Record<string, Record<string, DefinitionRpcExt>>;
  api: any;
  apiError: any;
  apiState: any;
};

const initialState: State = {
  // These are the states
  socket: RELAY_CHAIN_ENDPOINT,
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

const connect = (state: any, dispatch: any) => {
  const { apiState, socket, jsonrpc } = state;
  // We only want this function to be performed once
  if (apiState) return;

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

const RelayApiContext = React.createContext(defaultValue);

const RelayApiContextProvider = (props: any) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { toastError, toastSuccess } = useToast();

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
    connect(state, dispatch);
  }, [process.env.RELAY_CHAIN_ENDPOINT]);

  return (
    <RelayApiContext.Provider value={{ state }}>
      {props.children}
    </RelayApiContext.Provider>
  );
};
const useRelayApi = () => useContext(RelayApiContext);

export { RelayApiContextProvider, useRelayApi };
