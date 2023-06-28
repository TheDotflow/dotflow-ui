import AddIcon from '@mui/icons-material/Add';
import { LoadingButton } from '@mui/lab';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useState } from 'react';

import { useToast } from '@/contexts/Toast';
import { useAddressBook } from '@/contracts/addressbook/context';

export const CreateAddressBook = () => {
  const { api, activeAccount } = useInkathon();
  const { toastError, toastSuccess } = useToast();
  const { contract, fetchInfo } = useAddressBook();

  const [creating, setCreating] = useState(false);

  const onCreateAddressBook = async () => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot create address book. Please check if you are connected to the network.'
      );
      return;
    }
    setCreating(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'create_address_book',
        {},
        []
      );
      toastSuccess('Successfully created your address book.');
      fetchInfo();
    } catch (e: any) {
      toastError(
        `Failed to create address book. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <LoadingButton
      variant='contained'
      className='btn-primary'
      startIcon={<AddIcon />}
      loading={creating}
      loadingPosition='start'
      onClick={onCreateAddressBook}
    >
      Create Address Book
    </LoadingButton>
  );
};
