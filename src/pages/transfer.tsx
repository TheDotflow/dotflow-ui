import {
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  FormLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import styles from '@styles/pages/transfer.module.scss';
import { useCallback, useEffect, useState } from 'react';

import { useRelayApi } from '@/contexts/RelayApi';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

const TransferPage = () => {
  const { networks } = useIdentity();
  const [sourceChainId, setSourceChainId] = useState<number>();
  const [destChainId, setDestChainId] = useState<number>();
  const {
    state: { api: relayApi },
  } = useRelayApi();
  const { toastSuccess, toastError } = useToast();
  const [loadingAssets, setLoadingAssets] = useState(false);

  const loadAssets = useCallback(async () => {
    if (sourceChainId === undefined || destChainId === undefined) return;
    setLoadingAssets(true);

    if (sourceChainId !== destChainId) {
      const hrmp = await relayApi.query.hrmp.hrmpChannels({
        sender: sourceChainId,
        recipient: destChainId,
      });

      if (hrmp.isEmpty) {
        toastError(
          "There's no HRMP channel open between the source and destination chain"
        );
      }
    }

    setLoadingAssets(false);
  }, [sourceChainId, destChainId]);

  useEffect(() => {
    loadAssets();
  }, [sourceChainId, destChainId]);

  return (
    <Box className={styles.transferContainer}>
      <Box className='form-group'>
        <FormControl className='form-item'>
          <FormLabel>Source chain</FormLabel>
          <TextField
            label='Select source chain'
            select
            sx={{ mt: '8px' }}
            required
            value={sourceChainId || ''}
            onChange={(e) => setSourceChainId(Number(e.target.value))}
          >
            {Object.values(networks).map((network, index) => (
              <MenuItem value={network.paraId} key={index}>
                {network.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        <FormControl className='form-item'>
          <FormLabel>Destination chain</FormLabel>
          <TextField
            label='Select destination chain'
            select
            sx={{ mt: '8px' }}
            required
            value={destChainId || ''}
            onChange={(e) => setDestChainId(Number(e.target.value))}
          >
            {Object.values(networks).map((network, index) => (
              <MenuItem value={network.paraId} key={index}>
                {network.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingAssets}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </Box>
  );
};

export default TransferPage;
