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
import { Address, IdentityNo, NetworkId, Networks } from '../types';

interface IdentityContract {
  identityNo: number | null;
  networks: Networks;
  addresses: Array<Address>;
  contract: ContractPromise | undefined;
  fetchIdentityNo: () => Promise<void>;
  fetchAddresses: () => Promise<void>;
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
      output.map((item: any) => {
        const { name, ss58Prefix } = item[1];
        _networks[Number(item[0])] = {
          name,
          ss58Prefix: Number(ss58Prefix.replace(',', '')),
        };
      });
      setNetworks(_networks);
    } catch (e) {
      setNetworks({});
    }
  }, [api, contract]);

  const fetchAddresses = useCallback(async () => {
    if (!api || !contract || identityNo === null) {
      setAddresses([]);
      return;
    }
    try {
      const result = await contractQuery(api, '', contract, 'identity', {}, [
        identityNo,
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
      setAddresses(_addresses);
    } catch (e) {
      setAddresses([]);
    }
  }, [api, contract, identityNo]);

  useEffect(() => {
    void fetchAddresses();
  }, [api, contract, identityNo, fetchAddresses]);

  useEffect(() => {
    void fetchNetworks();
  }, [api, contract, fetchNetworks]);

  useEffect(() => {
    void fetchIdentityNo();
  }, [activeAccount, api, contract, fetchIdentityNo]);

  useEffect(() => {
    void fetchNetworks();
  }, [api, contract, fetchNetworks]);

  useEffect(() => {
    void fetchIdentityNo();
  }, [activeAccount, api, contract, fetchIdentityNo]);

  return (
    <IdentityContext.Provider
      value={{
        contract,
        identityNo,
        addresses,
        networks,
        fetchAddresses,
        fetchIdentityNo,
      }}
    >
      {children}
    </IdentityContext.Provider>
  );
};

const useIdentity = () => useContext(IdentityContext);

export { IdentityContractProvider, useIdentity };
