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
import { useState } from 'react';

import { LOCAL_STORAGE_KEY } from '@/consts';

interface ImportKeyModalProps {
  open: boolean;
  onClose: () => void;
}
export const ImportKeyModal = ({ open, onClose }: ImportKeyModalProps) => {
  const [identityKey, setIdentityKey] = useState<string>('');

  const onImport = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, identityKey);
    onClose();
  };

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
                inputProps={{
                  maxLength: 64,
                }}
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
