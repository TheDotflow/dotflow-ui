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

interface IdentityContract {
  identityNo: number | null;
  contract: ContractPromise | undefined;
  getNetworkName: (_networkId: number | string) => Promise<string | null>;
}

const defaultIdentity: IdentityContract = {
  identityNo: null,
  contract: undefined,
  getNetworkName: async () => null,
};

const IdentityContext = createContext<IdentityContract>(defaultIdentity);

interface Props {
  children: React.ReactNode;
}

const IdentityContractProvider = ({ children }: Props) => {
  const { contract } = useContract(IdentityMetadata, CONTRACT_IDENTITY);
  const { api, activeAccount } = useInkathon();
  const [identityNo, setIdentityNo] = useState<number | null>(null);

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
      setIdentityNo(Number(output));
    } catch (e) {
      setIdentityNo(null);
    }
  }, [activeAccount, api, contract]);

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
    <IdentityContext.Provider value={{ identityNo, contract, getNetworkName }}>
      {children}
    </IdentityContext.Provider>
  );
};

const useIdentity = () => useContext(IdentityContext);

export { IdentityContractProvider, useIdentity };
