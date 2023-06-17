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
  MenuItem,
  TextField,
} from '@mui/material';
import { validateAddress } from '@polkadot/util-crypto';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import IdentityKey from '@/utils/identityKey';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { NetworkId } from '@/contracts/types';

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddAddressModal = ({ open, onClose }: AddAddressModalProps) => {
  const { api, activeAccount } = useInkathon();
  const { networks, contract } = useIdentity();
  const { toastError, toastSuccess } = useToast();

  const [networkId, setNetworkId] = useState<NetworkId | undefined>();
  const [networkAddress, setNetworkAddress] = useState<string | undefined>();
  const [working, setWorking] = useState(false);

  const onSubmit = async () => {
    if (!networkAddress || networkAddress.trim().length === 0) {
      toastError('Please input your address');
      return;
    }
    if (networkId == undefined) {
      toastError('Please specify the network');
      return;
    }

    try {
      validateAddress(networkAddress, true, networks[networkId].ss58Prefix);
    } catch {
      toastError('Invalid address');
      return;
    }

    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot add an address. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);

    let identityKey = localStorage.getItem('identity-key') || '';

    if (!IdentityKey.containsNetworkId(identityKey, networkId)) {
      identityKey = IdentityKey.newCipher(identityKey, networkId);
      localStorage.setItem('identity-key', identityKey);
    }

    const encryptedAddress = IdentityKey.encryptAddress(
      identityKey,
      networkId,
      networkAddress
    );

    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'add_address',
        {},
        [networkId, encryptedAddress]
      );

      toastSuccess('Successfully added your address.');
      setWorking(false);
      onClose();
    } catch (e: any) {
      toastError(
        `Failed to add address. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
      setWorking(false);
    }
  };

  useEffect(() => {
    setNetworkId(undefined);
    setNetworkAddress(undefined);
    setWorking(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Box className='form-group' component='form'>
            <FormControl className='form-item'>
              <FormLabel>List of networks</FormLabel>
              <TextField
                label='Select a network'
                select
                sx={{ mt: '8px' }}
                required
                value={networkId}
                onChange={(e) => setNetworkId(Number(e.target.value))}
              >
                {Object.entries(networks).map(([id, network], index) => (
                  <MenuItem value={id} key={index}>
                    {network.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl className='form-item'>
              <FormLabel>Address</FormLabel>
              <TextField
                placeholder='Enter address'
                inputProps={{
                  maxLength: 64,
                }}
                required
                value={networkAddress}
                error={networkAddress === ''}
                onChange={(e) => setNetworkAddress(e.target.value)}
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
                <span>{`${(networkAddress || '').length}/64`}</span>
              </FormHelperText>
            </FormControl>
          </Box>
          <Box className='modal-buttons'>
            <Button
              className='btn-ok'
              variant='contained'
              onClick={onSubmit}
              sx={{ gap: '8px' }}
              disabled={working}
            >
              {working && (
                <CircularProgress size='20px' sx={{ color: 'white' }} />
              )}
              Submit
            </Button>
            <Button onClick={onClose} className='btn-cancel' disabled={working}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
