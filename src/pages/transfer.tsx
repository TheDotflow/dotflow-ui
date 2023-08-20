import { Box, FormLabel, MenuItem, TextField } from '@mui/material';
import '@styles/pages/transfer.module.scss';

import { useIdentity } from '@/contracts';

const TransferPage = () => {
  const { networks } = useIdentity();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        ml: 'auto',
        mr: 'auto',
        minWidth: 500,
        px: '16px',
        py: '24px',
      }}
    >
      <FormLabel>List of networks</FormLabel>
      <TextField
        label='Select source chain'
        select
        sx={{ mt: '8px' }}
        required
        // value={networkId}
        // onChange={(e) => setNetworkId(Number(e.target.value))}
      >
        {Object.entries(networks).map(([id, network], index) => (
          <MenuItem value={id} key={index}>
            {network.name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default TransferPage;
