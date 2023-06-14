import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  TextField,
} from '@mui/material';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { NetworkId } from '@/contracts/types';

interface EditAddressModalProps {
  open: boolean;
  onClose: () => void;
  networkId?: NetworkId;
}
export const EditAddressModal = ({
  networkId,
  open,
  onClose,
}: EditAddressModalProps) => {
  const { api, activeAccount } = useInkathon();
  const { contract } = useIdentity();
  const { toastError, toastSuccess } = useToast();
  const [newAddress, setNewAddress] = useState<string>('');
  const [working, setWorking] = useState(false);

  const onSave = async () => {
    if (networkId === undefined) {
      toastError('Invalid network');
      return;
    }
    if (!newAddress || newAddress.trim().length === 0) {
      toastError('Please input the new address');
      return;
    }
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot update address. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'update_address',
        {},
        [networkId, newAddress]
      );

      toastSuccess('Successfully updated your address.');
      setWorking(false);
      onClose();
    } catch (e: any) {
      toastError(
        `Failed to update address. Error: ${
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
    setNewAddress('');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Box className='form-group'>
            <FormControl className='form-item'>
              <FormLabel>New Address</FormLabel>
              <TextField
                placeholder='Enter address'
                inputProps={{
                  maxLength: 64,
                }}
                required
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <FormHelperText
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  mx: '4px',
                }}
              >
                <span>Maximum 64 characters</span>
                <span>{`${newAddress.length || 0}/64`}</span>
              </FormHelperText>
            </FormControl>
          </Box>
          <Box className='modal-buttons'>
            <Button
              className='btn-ok'
              variant='contained'
              onClick={onSave}
              sx={{ gap: '8px' }}
              disabled={working}
            >
              {working && (
                <CircularProgress size='20px' sx={{ color: 'white' }} />
              )}
              Save
            </Button>
            <Button onClick={onClose} className='btn-cancel' disabled={working}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
