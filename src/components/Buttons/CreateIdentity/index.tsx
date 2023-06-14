import AddIcon from '@mui/icons-material/Add';
import { Button, CircularProgress } from '@mui/material';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useState } from 'react';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

export const CreateIdentity = () => {
  const { api, activeAccount } = useInkathon();
  const { toastError, toastSuccess } = useToast();
  const { contract, fetchIdentityNo } = useIdentity();

  const [creating, setCreating] = useState(false);
  const onCreateIdentity = async () => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot create identity. Please check if you are connected to the network'
      );
      return;
    }
    setCreating(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'create_identity',
        {},
        []
      );

      toastSuccess('Successfully created your identity.');
      fetchIdentityNo();
    } catch (e: any) {
      toastError(
        `Failed to create identity. Error: ${
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
    <Button
      variant='contained'
      className='btn-primary'
      startIcon={creating ? <></> : <AddIcon />}
      onClick={onCreateIdentity}
      disabled={creating}
      sx={{ gap: !creating ? 0 : '8px' }}
    >
      {creating && <CircularProgress size='16px' />}
      Create Identity
    </Button>
  );
};
