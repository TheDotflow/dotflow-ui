import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { LoadingButton } from '@mui/lab';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useConfirm } from 'material-ui-confirm';
import { useState } from 'react';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

export const RemoveIdentity = () => {
  const confirm = useConfirm();
  const { api, activeAccount } = useInkathon();

  const { toastError, toastSuccess } = useToast();
  const { contract, fetchIdentityNo } = useIdentity();

  const [removing, setRemoving] = useState(false);

  const removeIdentity = async () => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot remove identity. Please check if you are connected to the network'
      );
      return;
    }
    setRemoving(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'remove_identity',
        {},
        []
      );

      toastSuccess('Successfully removed your identity.');
      fetchIdentityNo();
    } catch (e: any) {
      toastError(
        `Failed to remove identity. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
    } finally {
      setRemoving(false);
    }
  };

  const onRemoveIdentity = () => {
    confirm({
      description:
        'This will permanently remove your identity and you will lose all the addresses stored on chain.',
    }).then(removeIdentity);
  };

  return (
    <LoadingButton
      variant='contained'
      className='btn-primary'
      startIcon={<DeleteRoundedIcon />}
      onClick={onRemoveIdentity}
      loading={removing}
      loadingPosition='start'
    >
      Remove Identity
    </LoadingButton>
  );
};
