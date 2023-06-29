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
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';

import { useToast } from '@/contexts/Toast';
import { useAddressBook } from '@/contracts/addressbook/context';

interface EditNicknameProps {
  open: boolean;
  onClose: () => void;
  identityNo: number;
}

export const EditNicknameModal = ({
  open,
  onClose,
  identityNo,
}: EditNicknameProps) => {
  const [nickName, setNickname] = useState('');
  const [working, setWorking] = useState(false);

  const { toastError, toastSuccess } = useToast();
  const { api, activeAccount } = useInkathon();
  const { contract, fetchIdentities } = useAddressBook();
  const confirm = useConfirm();

  useEffect(() => {
    setNickname('');
    setWorking(false);
  }, [open]);

  const updateNickname = async () => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot update nickname. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'update_nickname',
        {},
        [identityNo, nickName ?? null]
      );

      toastSuccess('Successfully updated the nickname.');
      fetchIdentities();
      setWorking(false);
      onClose();
    } catch (e: any) {
      toastError(
        `Failed to update nickname. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
      setWorking(false);
    }
  };

  const onSave = async () => {
    if (!nickName || nickName.trim().length === 0) {
      confirm({
        description: 'This will remove the nickname for this identity.',
      }).then(() => updateNickname());
    } else {
      updateNickname();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Edit Nickname</DialogTitle>
        <DialogContent>
          <Box className='form-group'>
            <FormControl className='form-item'>
              <FormLabel>New nickname</FormLabel>
              <TextField
                placeholder='Enter new nickname'
                inputProps={{
                  maxLength: 16,
                }}
                required
                value={nickName}
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
                <span>{`${nickName.length || 0}/16`}</span>
              </FormHelperText>
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
