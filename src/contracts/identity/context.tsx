import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import {
  contractQuery,
  decodeOutput,
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { Chaindata } from 'chaindata';
import ss58registry from 'chaindata/ss58registry';
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
import { Address, ChainConsts, ChainId, Chains, IdentityNo } from '../types';
import { useRelay } from '@/contexts/RelayApi';
import { Network } from 'types/types-arguments/identity';

interface IdentityContract {
  identityNo: number | null;
  chains: Chains;
  // These are the chains on both kusama and polkadot.
  getAllChains: (_id: number) => Promise<Array<{ id: number, relay: string, name: string }>>;
  addresses: Array<Address>;
  contract: ContractPromise | undefined;
  fetchIdentityNo: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
  getAddresses: (_id: number) => Promise<Address[]>;
  loading: boolean;
}

const defaultIdentity: IdentityContract = {
  identityNo: null,
  chains: {},
  getAllChains: async (): Promise<Array<{ id: number, relay: string, name: string }>> => {
    return []
  },
  addresses: [],
  contract: undefined,

  fetchIdentityNo: async () => {
    /**/
  },
  fetchAddresses: async () => {
    /* */
  },
  getAddresses: async (): Promise<Address[]> => {
    return [];
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
  const [chains, setChains] = useState<Chains>({});
  const [addresses, setAddresses] = useState<Array<Address>>([]);
  const [loadingIdentityNo, setLoadingIdentityNo] = useState(false);
  const [loadingChains, setLoadingChains] = useState(false);
  const { toastError } = useToast();
  const { relay } = useRelay();

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

  const fetchChains = useCallback(async () => {
    if (!api || !contract) {
      setChains({});
      return;
    }

    const getChainInfo = async (chainId: number): Promise<ChainConsts | null> => {
      const chaindata = new Chaindata();

      try {
        const chain = await chaindata.getChain(chainId, relay);

        if (!chain) {
          return null;
        }

        const ss58Result = await ss58registry(chain.id);

        const rpcCount = chain.rpcs.length;
        const rpcIndex = Math.min(Math.floor(Math.random() * rpcCount), rpcCount - 1);
        const rpc = chain.rpcs[rpcIndex].url;

        const ss58Prefix = ss58Result ? ss58Result : await fetchSs58Prefix(rpc);

        return {
          name: chain.name,
          ss58Prefix: ss58Prefix,
          paraId: chainId,
          logo: chain.logo,
          rpc
        };
      } catch (e) {
        toastError && toastError(`Failed to get chain info.`);
        return null;
      }
    };

    const fetchSs58Prefix = async (rpc: string): Promise<number> => {
      const provider = new WsProvider(rpc);
      const api = new ApiPromise({ provider, rpc: jsonrpc });

      await api.isReady;

      const ss58Prefix: number =
        api.consts.system.ss58Prefix.toPrimitive() as number;

      await api.disconnect();

      return ss58Prefix;
    }

    setLoadingChains(true);
    try {
      const result = await contractQuery(
        api,
        '',
        contract,
        'available_chains',
        {},
        [relay == "polkadot" ? Network.polkadot : Network.kusama]
      );
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'available_chains'
      );
      if (isError) throw new Error(decodedOutput);

      const _chains: Chains = {};

      for await (const item of output) {
        const chainId: number = parseInt(item[0].replace(/,/g, ''));
        const { accountType } = item[1];
        const info = await getChainInfo(chainId);
        if (info)
          _chains[chainId] = {
            accountType,
            ...info,
          };
      }
      setChains(_chains);
    } catch (e: any) {
      toastError(e.toString());
    }
    setLoadingChains(false);
  }, [api, contract, toastError, relay]);

  const getAddresses = async (no: number): Promise<Address[]> => {
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
      const records = output.addresses
        .filter((address: any) => address[0][1].toLowerCase() === relay)
        .map((address: any) => [address[0][0], address[1]]);
      const _addresses: Array<Address> = [];
      for (let idx = 0; idx < records.length; ++idx) {
        const record = records[idx];
        const chainId: ChainId = parseInt(record[0].replace(/,/g, ''));
        const address = record[1]; // FIXME: Decode address here
        _addresses.push({
          chainId,
          address,
        });
      }
      return _addresses;
    } catch (e) {
      return [];
    }
  };

  const getAllChains = async (no: number): Promise<Array<{ id: number, relay: string, name: string }>> => {
    if (!api || !contract) return [];

    const chaindata = new Chaindata();
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

      return output.addresses.map((record: any) => {
        return {
          id: record[0][0],
          name: record[0][1],
          relay: record[0][1].toString().toLowerCase()
        }
      });
    } catch (e) {
      return [];
    }
  }

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
  }, [api, contract, identityNo, relay]);

  useEffect(() => {
    void fetchAddresses();
  }, [api, contract, identityNo, fetchAddresses]);

  useEffect(() => {
    fetchIdentityNo();
  }, [api, contract, activeAccount]);

  useEffect(() => {
    fetchChains();
  }, [api?.isReady, contract?.address, relay]);

  return (
    <IdentityContext.Provider
      value={{
        contract,
        identityNo,
        addresses,
        chains,
        getAllChains,
        fetchAddresses,
        fetchIdentityNo,
        getAddresses,
        loading: loadingIdentityNo || loadingChains,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

const useIdentity = () => useContext(IdentityContext);

export { IdentityContractProvider, useIdentity };
