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

interface TransferOwnershipModalProps {
  open: boolean;
  onClose: () => void;
}

export const TransferOwnershipModal = ({
  open,
  onClose,
}: TransferOwnershipModalProps) => {
  const { api, activeAccount } = useInkathon();
  const { contract } = useIdentity();
  const { toastError, toastSuccess } = useToast();

  const [identityNo, setIdentityNo] = useState<number | undefined>();
  const [newOwner, setNewOwner] = useState<string | undefined>();
  const [working, setWorking] = useState(false);

  const onSubmit = async () => {
    // The account should be the recovery account of the identity
    if (identityNo === undefined) {
      toastError('Please input identity no.');
      return;
    }

    if (!newOwner) {
      toastError('Please input address of the new owner');
      return;
    }

    if (!isValidAddress(newOwner, 42)) {
      toastError('Please input a valid Substrate address');
      return;
    }

    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot transfer ownership. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'transfer_ownership',
        {},
        [identityNo, newOwner]
      );

      toastSuccess(
        `Successfully transfered ownership of ${identityNo} to ${newOwner}.`
      );

      setWorking(false);

      onClose();
    } catch (e: any) {
      toastError(
        `Failed to transfer ownership. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
      setWorking(false);
    }
  };

  useEffect(() => {
    setWorking(false);
    setIdentityNo(undefined);
    setNewOwner(undefined);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Transfer Ownership</DialogTitle>
        <DialogContent>
          <Box className='form-group' component='form'>
            <FormControl className='form-item'>
              <FormLabel>Identity No</FormLabel>
              <TextField
                placeholder='Enter identity no'
                type='number'
                required
                value={identityNo}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  value >= 0 && setIdentityNo(value);
                }}
              />
            </FormControl>
            <FormControl className='form-item'>
              <FormLabel>New Owner Address</FormLabel>
              <TextField
                placeholder='Enter address of the new owner'
                required
                value={newOwner}
                error={newOwner === ''}
                onChange={(e) => setNewOwner(e.target.value)}
              />
            </FormControl>
          </Box>
          <Box className='modal-buttons'>
            <LoadingButton
              className='btn-ok'
              variant='contained'
              onClick={onSubmit}
              loading={working}
            >
              Transfer Ownership
            </LoadingButton>
            <Button onClick={onClose} className='btn-cancel' disabled={working}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
