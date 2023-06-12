import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  TextField,
} from '@mui/material';

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddAddressModal = ({ open, onClose }: AddAddressModalProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Box className='form-group'>
            <FormControl className='form-item'>
              <FormLabel>List of networks</FormLabel>
              <TextField label='Select a network' select sx={{ mt: '8px' }}>
                <MenuItem value='Polkadot'>Polkadot</MenuItem>
                <MenuItem value='Kusama'>Kusama</MenuItem>
                <MenuItem value='Moonbeam'>Moonbeam</MenuItem>
                <MenuItem value='Astar'>Astar</MenuItem>
              </TextField>
            </FormControl>
            <FormControl className='form-item'>
              <FormLabel>Address</FormLabel>
              <TextField
                placeholder='Enter address'
                inputProps={{
                  maxLength: 64,
                }}
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
                <span>0/64</span>
              </FormHelperText>
            </FormControl>
          </Box>
        </DialogContent>
        <Box className='modal-buttons'>
          <Button className='btn-ok' variant='contained'>
            Submit
          </Button>
          <Button onClick={onClose} className='btn-cancel'>
            Close
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
