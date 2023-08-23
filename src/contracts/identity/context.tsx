import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import {
  contractQuery,
  decodeOutput,
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useToast } from '@/contexts/Toast';

import { IdentityMetadata } from '.';
import { CONTRACT_IDENTITY } from '..';
import {
  Address,
  IdentityNo,
  NetworkConsts,
  NetworkId,
  Networks,
} from '../types';

interface IdentityContract {
  identityNo: number | null;
  networks: Networks;
  addresses: Array<Address>;
  contract: ContractPromise | undefined;
  fetchIdentityNo: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  loading: boolean;
}

const defaultIdentity: IdentityContract = {
  identityNo: null,
  networks: {},
  addresses: [],
  contract: undefined,

  fetchIdentityNo: async () => {
    /**/
  },
  fetchAddresses: async () => {
    /* */
  },
  loading: true,
};

const IdentityContext = createContext<IdentityContract>(defaultIdentity);

interface Props {
  children: React.ReactNode;
}

const IdentityContractProvider = ({ children }: Props) => {
  const { contract } = useContract(IdentityMetadata, CONTRACT_IDENTITY);
  const { api, activeAccount } = useInkathon();
  const [identityNo, setIdentityNo] = useState<IdentityNo>(null);
  const [networks, setNetworks] = useState<Networks>({});
  const [addresses, setAddresses] = useState<Array<Address>>([]);
  const [loadingIdentityNo, setLoadingIdentityNo] = useState(false);
  const [loadingNetworks, setLoadingNetworks] = useState(false);
  const { toastError } = useToast();

  const fetchIdentityNo = useCallback(async () => {
    if (!api || !contract || !activeAccount) {
      setIdentityNo(null);
      return;
    }
    setLoadingIdentityNo(true);
    try {
      const result = await contractQuery(api, '', contract, 'identity_of', {}, [
        activeAccount.address,
      ]);
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'identity_of'
      );
      if (isError) throw new Error(decodedOutput);
      if (!output) setIdentityNo(null);
      else setIdentityNo(Number(output));
    } catch (e) {
      setIdentityNo(null);
    }
    setLoadingIdentityNo(false);
  }, [activeAccount, api, contract]);

  const fetchNetworks = useCallback(async () => {
    if (!api || !contract) {
      setNetworks({});
      return;
    }

    const getChainInfo = async (
      rpcUrls: string[]
    ): Promise<NetworkConsts | null> => {
      const count = rpcUrls.length;
      const rpcIndex = Math.min(Math.floor(Math.random() * count), count - 1);
      const rpc = rpcUrls[rpcIndex];
      try {
        const provider = new WsProvider(rpc);
        const api = new ApiPromise({ provider, rpc: jsonrpc });

        await api.isReady;

        const ss58Prefix: number =
          api.consts.system.ss58Prefix.toPrimitive() as number;
        const name = (await api.rpc.system.chain()).toString();
        const paraId = (
          await api.query.parachainInfo.parachainId()
        ).toPrimitive() as number;

        return {
          name,
          ss58Prefix,
          paraId,
        };
      } catch (e) {
        toastError && toastError(`Failed to get chain info for ${rpc}`);
        return null;
      }
    };

    setLoadingNetworks(true);
    try {
      const result = await contractQuery(
        api,
        '',
        contract,
        'available_networks',
        {}
      );
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'available_networks'
      );
      if (isError) throw new Error(decodedOutput);

      const _networks: Networks = {};

      for await (const item of output) {
        const networkId = Number(item[0]);
        const { accountType, rpcUrls } = item[1];
        const info = await getChainInfo(rpcUrls);
        if (info)
          _networks[networkId] = {
            rpcUrls,
            accountType,
            ...info,
          };
      }
      setNetworks(_networks);
    } catch (e: any) {
      toastError(e.toString());
    }
    setLoadingNetworks(false);
  }, [api, contract, toastError]);

  const getAddresses = async (no: number) => {
    if (!api || !contract) return [];
    try {
      const result = await contractQuery(api, '', contract, 'identity', {}, [
        no,
      ]);
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'identity'
      );
      if (isError) throw new Error(decodedOutput);
      const records = output.addresses;
      const _addresses: Array<Address> = [];
      for (let idx = 0; idx < records.length; ++idx) {
        const record = records[idx];
        const networkId: NetworkId = Number(record[0]);
        const address = record[1]; // FIXME: Decode address here
        _addresses.push({
          networkId,
          address,
        });
      }
      return _addresses;
    } catch (e) {
      return [];
    }
  };

  const fetchAddresses = useCallback(async () => {
    if (!api || !contract || identityNo === null) {
      setAddresses([]);
      return;
    }
    try {
      const _addresses = await getAddresses(identityNo);
      setAddresses(_addresses);
    } catch {
      setAddresses([]);
    }
  }, [api, contract, identityNo]);

  useEffect(() => {
    void fetchAddresses();
  }, [api, contract, identityNo, fetchAddresses]);

  useEffect(() => {
    fetchIdentityNo();
  }, [api, contract, activeAccount]);

  useEffect(() => {
    fetchNetworks();
  }, [api?.isReady, contract?.address]);

  return (
    <IdentityContext.Provider
      value={{
        contract,
        identityNo,
        addresses,
        networks,
        fetchAddresses,
        fetchIdentityNo,
        loading: loadingIdentityNo || loadingNetworks,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

const useIdentity = () => useContext(IdentityContext);

export { IdentityContractProvider, useIdentity };
