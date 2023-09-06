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

import { RELAY_CHAIN } from '@/consts';
import { useToast } from '@/contexts/Toast';

import { IdentityMetadata } from '.';
import { CONTRACT_IDENTITY } from '..';
import {
  Address,
  ChainConsts,
  ChainId,
  Chains,
  IdentityNo,
} from '../types';

interface IdentityContract {
  identityNo: number | null;
  chains: Chains;
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

    const getChainInfo = async (
      rpcUrls: string[],
      chainId: number
    ): Promise<ChainConsts | null> => {
      const count = rpcUrls.length;
      const rpcIndex = Math.min(Math.floor(Math.random() * count), count - 1);
      const rpc = rpcUrls[rpcIndex];

      const chaindata = new Chaindata();
      await chaindata.load();

      try {
        const chain = chaindata.getChains().find(
          (c) => c.paraId ?
            c.paraId === chainId && c.relay.id === RELAY_CHAIN
            :
            chainId === 0 && c.id === RELAY_CHAIN
        );

        if (!chain) {
          return null;
        }

        const ss58Result = await ss58registry(chain.id);

        const rpcCount = chain.rpcs.length;
        const rpcIndex = Math.min(Math.floor(Math.random() * rpcCount), rpcCount - 1);

        const ss58Prefix = ss58Result ? ss58Result : await fetchSs58Prefix(chain.rpcs[rpcIndex].url);

        return {
          name: chain.name,
          ss58Prefix: ss58Prefix,
          paraId: chainId,
        };
      } catch (e) {
        toastError && toastError(`Failed to get chain info for ${rpc}`);
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
        {}
      );
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'available_chains'
      );
      if (isError) throw new Error(decodedOutput);

      const _chains: Chains = {};

      for await (const item of output) {
        const chainId = parseInt(item[0].replace(/,/g, ""));
        const { accountType, rpcUrls } = item[1];
        const info = await getChainInfo(rpcUrls, chainId);
        if (info)
          _chains[chainId] = {
            rpcUrls,
            accountType,
            ...info,
          };
      }
      setChains(_chains);
    } catch (e: any) {
      toastError(e.toString());
    }
    setLoadingChains(false);
  }, [api, contract, toastError]);

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
      const records = output.addresses;
      const _addresses: Array<Address> = [];
      for (let idx = 0; idx < records.length; ++idx) {
        const record = records[idx];
        const chainId: ChainId = parseInt(record[0].replace(/,/g, ""));
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
    fetchChains();
  }, [api?.isReady, contract?.address]);

  return (
    <IdentityContext.Provider
      value={{
        contract,
        identityNo,
        addresses,
        chains,
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
