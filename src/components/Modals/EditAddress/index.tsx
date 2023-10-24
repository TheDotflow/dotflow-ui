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
import KeyStore from '@/utils/keyStore';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { ChainId } from '@/contracts/types';
import { useRelay } from '@/contexts/RelayApi';
import { Network } from 'types/types-arguments/identity';

interface EditAddressModalProps {
  open: boolean;
  onClose: () => void;
  chainId?: ChainId;
}
export const EditAddressModal = ({
  chainId,
  open,
  onClose,
}: EditAddressModalProps) => {
  const { api, activeAccount } = useInkathon();
  const { contract, identityNo, chains } = useIdentity();
  const { toastError, toastSuccess } = useToast();
  const [newAddress, setNewAddress] = useState<string>('');
  const [working, setWorking] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const { relay } = useRelay();

  const onSave = async () => {
    if (identityNo === null) {
      toastError("You don't have an identity yet.");
      return;
    }
    if (chainId === undefined) {
      toastError('Invalid chain');
      return;
    }
    if (!newAddress || newAddress.trim().length === 0) {
      toastError('Please input the new address');
      return;
    }

    if (!isValidAddress(newAddress, chains[chainId].ss58Prefix)) {
      toastError('Invalid address');
      return;
    }

    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot update address. Please check if you are connected to the chain'
      );
      return;
    }
    setWorking(true);

    let identityKey = KeyStore.readIdentityKey(identityNo) || '';

    if (!IdentityKey.containsChainId(identityKey, chainId, relay)) {
      identityKey = IdentityKey.newCipher(identityKey, chainId, relay);
      KeyStore.updateIdentityKey(identityNo, identityKey);
    }

    if (regenerate)
      identityKey = IdentityKey.updateCipher(identityKey, chainId, relay);

    const encryptedAddress = IdentityKey.encryptAddress(
      identityKey,
      chainId,
      newAddress,
      relay
    );

    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'update_address',
        {},
        [[chainId, relay === "polkadot" ? Network.polkadot : Network.kusama], encryptedAddress]
      );
      // Update the identity key when the user has updated his on-chain data
      KeyStore.updateIdentityKey(identityNo, identityKey);

      toastSuccess('Successfully updated your address.');
      setWorking(false);
      onClose();
    } catch (e: any) {
      toastError(
        `Failed to update address. Error: ${e.errorMessage === 'Error'
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
