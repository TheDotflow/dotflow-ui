import { ContractPromise } from '@polkadot/api-contract';
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

import { IdentityMetadata } from '.';
import { CONTRACT_IDENTITY } from '..';
import { IdentityNo, Networks } from '../types';

interface IdentityContract {
  identityNo: number | null;
  networks: Networks;
  contract: ContractPromise | undefined;
  getNetworkName: (_networkId: number | string) => Promise<string | null>;
  fetchIdentityNo: () => Promise<void>;
}

const defaultIdentity: IdentityContract = {
  identityNo: null,
  contract: undefined,
  networks: {},

  getNetworkName: async () => null,
  fetchIdentityNo: async () => {
    /**/
  },
};

const IdentityContext = createContext<IdentityContract>(defaultIdentity);

interface Props {
  children: React.ReactNode;
}

const IdentityContractProvider = ({ children }: Props) => {
  const { contract } = useContract(IdentityMetadata, CONTRACT_IDENTITY);
  const { api, activeAccount } = useInkathon();
  const [identityNo, setIdentityNo] = useState<IdentityNo>(null);
  const [networks, setNetworks] = useState({});

  const fetchIdentityNo = useCallback(async () => {
    if (!api || !contract || !activeAccount) {
      setIdentityNo(null);
      return;
    }
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
  }, [activeAccount, api, contract]);

  const fetchNetworks = useCallback(async () => {
    if (!api || !contract) {
      setNetworks({});
      return;
    }
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
      output.map((item: string[]) => {
        _networks[Number(item[0])] = item[1];
      });
      setNetworks(_networks);
    } catch (e) {
      setNetworks({});
    }
  }, [api, contract]);

  useEffect(() => {
    void fetchNetworks();
  }, [api, contract, fetchNetworks]);

  useEffect(() => {
    void fetchIdentityNo();
  }, [activeAccount, api, contract, fetchIdentityNo]);

  const getNetworkName = async (networkId: number | string) => {
    if (!api || !contract) {
      return null;
    }
    try {
      const result = await contractQuery(
        api,
        '',
        contract,
        'network_name_of',
        {},
        [networkId]
      );
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'network_name_of'
      );
      if (isError) throw new Error(decodedOutput);
      return output;
    } catch (e) {
      return null;
    }
  };

  return (
    <IdentityContext.Provider
      value={{
        identityNo,
        contract,
        getNetworkName,
        fetchIdentityNo,
        networks,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

const useIdentity = () => useContext(IdentityContext);

export { IdentityContractProvider, useIdentity };
