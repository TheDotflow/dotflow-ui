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
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';

import KeyStore from '@/utils/keyStore';

import { useToast } from '@/contexts/Toast';

interface ImportKeyModalProps {
  open: boolean;
  onClose: () => void;
  identityNo: number | null;
}
export const ImportKeyModal = ({
  open,
  onClose,
  identityNo,
}: ImportKeyModalProps) => {
  const [identityKey, setIdentityKey] = useState<string>('');
  const { toastError, toastSuccess } = useToast();
  const confirm = useConfirm();

  const onImport = () => {
    if (identityNo === null) {
      toastError("You don't have an identity yet.");
      return;
    }
    confirm({
      description:
        'This operation updates the identity key and you might lose access to your addresses.',
    }).then(() => {
      KeyStore.updateIdentityKey(identityNo, identityKey);
      toastSuccess('Successfully imported identity key.');
      onClose();
    });
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
