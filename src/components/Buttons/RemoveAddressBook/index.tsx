import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { LoadingButton } from '@mui/lab';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useConfirm } from 'material-ui-confirm';
import { useState } from 'react';

import { useToast } from '@/contexts/Toast';
import { useAddressBook } from '@/contracts/addressbook/context';

export const RemoveAddressBook = () => {
  const confirm = useConfirm();
  const { api, activeAccount } = useInkathon();
  const { toastError, toastSuccess } = useToast();
  const { contract, fetchInfo } = useAddressBook();

  const [removing, setRemoving] = useState(false);

  const removeAddressBook = async () => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot remove address book. Please check if you are connected to the network.'
      );
      return;
    }
    setRemoving(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'remove_address_book',
        {},
        []
      );
      toastSuccess('Successfully removed your address book.');
      fetchInfo();
    } catch (e: any) {
      toastError(
        `Failed to remove address book. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
    } finally {
      setRemoving(false);
    }
  };

  const onRemoveAddressBook = () => {
    confirm({
      description:
        'This will permanently remove your address book and you will lose all the identities stored in it.',
    }).then(removeAddressBook);
  };

  return (
    <LoadingButton
      variant='contained'
      className='btn-primary'
      startIcon={<DeleteRoundedIcon />}
      loading={removing}
      loadingPosition='start'
      onClick={onRemoveAddressBook}
    >
      Remove Address Book
    </LoadingButton>
  );
};
