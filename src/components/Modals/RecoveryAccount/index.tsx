import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  TextField,
} from '@mui/material';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { isValidAddress } from '@/utils';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

interface RecoveryAccountModalProps {
  open: boolean;
  onClose: () => void;
  identityNo: number | null;
}
export const RecoveryAccountModal = ({
  open,
  onClose,
  identityNo,
}: RecoveryAccountModalProps) => {
  const { api, activeAccount } = useInkathon();
  const { contract } = useIdentity();
  const [recoveryAccount, setRecoveryAccount] = useState<string>('');
  const { toastError, toastSuccess } = useToast();
  const [working, setWorking] = useState(false);

  const onSetRecoveryAccount = async () => {
    if (identityNo === null) {
      toastError("You don't have an identity yet.");
      return;
    }

    if (!recoveryAccount) {
      toastError('Please input your recovery account');
      return;
    }

    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot set recovery account. Please check if you are connected to the chain'
      );
      return;
    }

    if (!isValidAddress(recoveryAccount, 42)) {
      toastError('Please input a valid Substrate address');
      return;
    }

    setWorking(true);

    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'set_recovery_account',
        {},
        [recoveryAccount]
      );

      toastSuccess('Successfully set your recovery account.');
      setWorking(false);
      onClose();
    } catch (e: any) {
      toastError(`Failed to set recovery address. Error: ${e.errorMessage}`);
      setWorking(false);
    }
  };

  useEffect(() => setRecoveryAccount(''), [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Set Recovery Account</DialogTitle>
        <DialogContent>
          <Box className='form-group'>
            <FormControl className='form-item'>
              <FormLabel>Recovery Account</FormLabel>
              <TextField
                placeholder='Enter identity key'
                required
                value={recoveryAccount}
                onChange={(e) => setRecoveryAccount(e.target.value)}
              />
            </FormControl>
          </Box>
          <Box className='modal-buttons'>
            <LoadingButton
              className='btn-ok'
              variant='contained'
              onClick={onSetRecoveryAccount}
              loading={working}
            >
              Set Recovery Account
            </LoadingButton>
            <Button onClick={onClose} className='btn-cancel'>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
