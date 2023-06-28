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
import { useEffect, useState } from 'react';

import KeyStore from '@/utils/keyStore';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

interface ImportKeyModalProps {
  open: boolean;
  onClose: () => void;
}
export const ImportKeyModal = ({ open, onClose }: ImportKeyModalProps) => {
  const [identityKey, setIdentityKey] = useState<string>('');
  const { identityNo } = useIdentity();
  const { toastError } = useToast();

  const onImport = () => {
    if (identityNo === null) {
      toastError("You don't have an identity yet.");
      return;
    }
    KeyStore.updateIdentityKey(identityNo, identityKey);
    onClose();
  };

  useEffect(() => setIdentityKey(''), [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Import Identity Key</DialogTitle>
        <DialogContent>
          <Box className='form-group'>
            <FormControl className='form-item'>
              <FormLabel>Identity Key</FormLabel>
              <TextField
                placeholder='Enter identity key'
                required
                value={identityKey}
                onChange={(e) => setIdentityKey(e.target.value)}
              />
            </FormControl>
          </Box>
          <Box className='modal-buttons'>
            <Button className='btn-ok' variant='contained' onClick={onImport}>
              Import
            </Button>
            <Button onClick={onClose} className='btn-cancel'>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
