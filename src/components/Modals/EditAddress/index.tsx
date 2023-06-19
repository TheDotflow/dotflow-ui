import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  TextField,
} from '@mui/material';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { isValidAddress } from '@/utils';
import IdentityKey from '@/utils/identityKey';

import { LOCAL_STORAGE_KEY } from '@/consts';
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
  const { contract, networks } = useIdentity();
  const { toastError, toastSuccess } = useToast();
  const [newAddress, setNewAddress] = useState<string>('');
  const [working, setWorking] = useState(false);
  const [regenerate, setRegenerate] = useState(false);

  const onSave = async () => {
    if (networkId === undefined) {
      toastError('Invalid network');
      return;
    }
    if (!newAddress || newAddress.trim().length === 0) {
      toastError('Please input the new address');
      return;
    }

    if (!isValidAddress(newAddress, networks[networkId].ss58Prefix)) {
      toastError('Invalid address');
      return;
    }

    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot update address. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);

    let identityKey = localStorage.getItem(LOCAL_STORAGE_KEY) || '';

    if (!IdentityKey.containsNetworkId(identityKey, networkId)) {
      identityKey = IdentityKey.newCipher(identityKey, networkId);
      localStorage.setItem(LOCAL_STORAGE_KEY, identityKey);
    }

    if (regenerate)
      identityKey = IdentityKey.updateCipher(identityKey, networkId);

    const encryptedAddress = IdentityKey.encryptAddress(
      identityKey,
      networkId,
      newAddress
    );

    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'update_address',
        {},
        [networkId, encryptedAddress]
      );
      // Update the identity key when the user has updated his on-chain data
      localStorage.setItem(LOCAL_STORAGE_KEY, identityKey);

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
    setRegenerate(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Edit Address</DialogTitle>
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
            <FormControl>
              <FormControlLabel
                label='Restrict access to individuals who previously had access to the old address'
                control={
                  <Checkbox
                    value={regenerate}
                    onChange={(e) => setRegenerate(e.target.checked)}
                  />
                }
              />
            </FormControl>
          </Box>
          <Box className='modal-buttons'>
            <LoadingButton
              className='btn-ok'
              variant='contained'
              onClick={onSave}
              loading={working}
            >
              Save
            </LoadingButton>
            <Button onClick={onClose} className='btn-cancel' disabled={working}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
