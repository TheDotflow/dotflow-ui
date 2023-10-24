import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
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

import KeyStore from '@/utils/keyStore';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { useAddressBook } from '@/contracts/addressbook/context';

interface AddIdentityModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddIdentityModal = ({ open, onClose }: AddIdentityModalProps) => {
  const { api, activeAccount } = useInkathon();
  const { identityNo: myIdentity } = useIdentity();
  const { contract, fetchIdentities } = useAddressBook();
  const { toastError, toastSuccess } = useToast();

  const [identityKey, setIdentityKey] = useState<string | undefined>();
  const [nickname, setNickname] = useState<string | undefined>();
  const [working, setWorking] = useState(false);

  const onSubmit = async () => {
    if (!identityKey || identityKey.trim().length === 0) {
      toastError('Please input identity key.');
      return;
    }
    const firstColonIndex = identityKey.indexOf(':');
    const firstSemicolonIndex = identityKey.indexOf(';');
    const identityNo = Number(identityKey.substring(firstColonIndex + 1, firstSemicolonIndex));
    if (Number.isNaN(identityNo)) {
      toastError("Invalid identity key.");
      return;
    }
    if (identityNo === myIdentity) {
      toastError("You can't add your identity to the address book.");
      return;
    }
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot add identity. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'add_identity',
        {},
        [identityNo, !nickname ? null : nickname]
      );

      toastSuccess(`Successfully added an identity ${identityNo}.`);

      setWorking(false);

      KeyStore.updateIdentityKey(identityNo, identityKey);
      fetchIdentities();

      onClose();
    } catch (e: any) {
      toastError(
        `Failed to add identity. Error: ${e.errorMessage === 'Error'
          ? 'Please check your balance.'
          : e.errorMessage
        }`
      );
      setWorking(false);
    }
  };

  useEffect(() => {
    setNickname(undefined);
    setWorking(false);
    setIdentityKey(undefined);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Add Identity</DialogTitle>
        <DialogContent>
          <Box className='form-group' component='form'>
            <FormControl className='form-item'>
              <FormLabel>Nickname</FormLabel>
              <TextField
                placeholder='Enter nickname'
                inputProps={{
                  maxLength: 16,
                }}
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <FormHelperText
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  mx: '4px',
                }}
              >
                <span>Maximum 16 characters</span>
                <span>{`${(nickname || '').length}/16`}</span>
              </FormHelperText>
            </FormControl>
            <FormControl className='form-item'>
              <FormLabel>Identity Key</FormLabel>
              <TextField
                placeholder='Enter identity key'
                required
                value={identityKey}
                error={identityKey === ''}
                onChange={(e) => setIdentityKey(e.target.value)}
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
              Submit
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
