import {
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  FormLabel,
  List,
  ListItem,
  MenuItem,
  TextField,
} from '@mui/material';
import styles from '@styles/pages/transfer.module.scss';
import { useCallback, useEffect, useState } from 'react';

import AssetRegistry, { Asset } from '@/utils/assetRegistry';

import { RELAY_CHAIN } from '@/consts';
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
  const { toastError } = useToast();
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

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
        setAssets([]);
      } else {
        const _assets = await AssetRegistry.getSharedAssets(
          RELAY_CHAIN,
          sourceChainId,
          destChainId
        );
        setAssets(_assets);
      }
    } else {
      const _assets = await AssetRegistry.getAssetsOnBlockchain(
        RELAY_CHAIN,
        sourceChainId
      );
      setAssets(_assets);
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
        {!loadingAssets && (
          <List>
            {assets.map((asset, index) => (
              <ListItem key={index}>{asset.name}</ListItem>
            ))}
          </List>
        )}
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
