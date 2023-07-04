import { ContractPromise } from '@polkadot/api-contract';
import {
  contractQuery,
  decodeOutput,
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AddressBookMetadata } from '.';
import { CONTRACT_ADDRESS_BOOK } from '..';
import { IdentityRecord } from '../types';

interface AddressBookContract {
  identities: IdentityRecord[];
  hasAddressBook: boolean;
  fetchInfo: () => Promise<void>;
  fetchIdentities: () => Promise<void>;
  contract: ContractPromise | undefined;
}

const defaultAddressBook: AddressBookContract = {
  identities: [],
  hasAddressBook: false,
  contract: undefined,
  fetchInfo: async () => {
    /** Check whether the user has an address book or not. */
  },
  fetchIdentities: async () => {
    /** Fetch the identities stored in the address book. */
  },
};

const AddressBookContext =
  createContext<AddressBookContract>(defaultAddressBook);

interface Props {
  children: React.ReactNode;
}

const AddressBookContractProvider = ({ children }: Props) => {
  const { contract } = useContract(AddressBookMetadata, CONTRACT_ADDRESS_BOOK);
  const { api, activeAccount } = useInkathon();
  const [hasAddressBook, setHasAddressBook] = useState(false);
  const [identities, setIdentities] = useState<IdentityRecord[]>([]);

  const fetchInfo = useCallback(async () => {
    if (!api || !contract || !activeAccount) {
      setHasAddressBook(false);
      return;
    }
    try {
      const result = await contractQuery(
        api,
        activeAccount.address,
        contract,
        'has_address_book',
        {}
      );
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'has_address_book'
      );
      if (isError) throw new Error(decodedOutput);
      if (!output) setHasAddressBook(false);
      else setHasAddressBook(!!output);
    } catch (e) {
      setHasAddressBook(false);
    }
  }, [activeAccount, api, contract]);

  const fetchIdentities = useCallback(async () => {
    if (!api || !contract || !activeAccount) {
      setIdentities([]);
      return;
    }
    try {
      const result = await contractQuery(
        api,
        '',
        contract,
        'identities_of',
        {},
        [activeAccount.address]
      );
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'identities_of'
      );
      if (isError) throw new Error(decodedOutput);
      if (!output) setIdentities([]);
      else {
        setIdentities(
          output.map(
            ([identityNo, nickName]: string[]) =>
              ({
                identityNo: Number(identityNo.replace(',', '')),
                nickName,
              } as IdentityRecord)
          )
        );
      }
    } catch (e) {
      setIdentities([]);
    }
  }, [activeAccount, api, contract]);

  useEffect(() => {
    fetchInfo();
    fetchIdentities();
  }, [activeAccount, api, contract, fetchInfo, fetchIdentities]);

  return (
    <AddressBookContext.Provider
      value={{
        hasAddressBook,
        identities,
        fetchInfo,
        fetchIdentities,
        contract,
      }}
    >
      {children}
    </AddressBookContext.Provider>
  );
};

const useAddressBook = () => useContext(AddressBookContext);

export { AddressBookContractProvider, useAddressBook };
