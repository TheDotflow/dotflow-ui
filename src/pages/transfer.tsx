import {
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { useInkathon } from '@scio-labs/use-inkathon';
import styles from '@styles/pages/transfer.module.scss';
import { useCallback, useEffect, useState } from 'react';

import AssetRegistry, { Asset } from '@/utils/assetRegistry';

import { RELAY_CHAIN, ZERO } from '@/consts';
import { useRelayApi } from '@/contexts/RelayApi';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

const TransferPage = () => {
  const { networks } = useIdentity();
  const { activeAccount } = useInkathon();
  const [sourceChainId, setSourceChainId] = useState<number>();
  const [destChainId, setDestChainId] = useState<number>();
  const {
    state: { api: relayApi },
  } = useRelayApi();
  const { toastError } = useToast();
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tokenId, setTokenId] = useState<string>('');
  const canWork =
    !loadingAssets && sourceChainId !== undefined && destChainId !== undefined;
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [sourceBalance, setSourceBalance] = useState<bigint>(ZERO);

  const loadAssets = useCallback(async () => {
    if (sourceChainId === undefined || destChainId === undefined) return;
    setLoadingAssets(true);

    if (sourceChainId !== destChainId) {
      const hrmp = await relayApi.query.hrmp.hrmpChannels({
        sender: networks[sourceChainId].paraId,
        recipient: networks[destChainId].paraId,
      });

      if (hrmp.isEmpty) {
        toastError(
          "There's no HRMP channel open between the source and destination chain"
        );
        setAssets([]);
      } else {
        const _assets = await AssetRegistry.assetsSupportedOnBothChains(
          RELAY_CHAIN,
          networks[sourceChainId].paraId,
          networks[destChainId].paraId
        );
        setAssets(_assets);
      }
    } else {
      const _assets = await AssetRegistry.getAssetsOnBlockchain(
        RELAY_CHAIN,
        networks[sourceChainId].paraId
      );
      setTokenId('');
      setAssets(_assets);
    }

    setLoadingAssets(false);
  }, [sourceChainId, destChainId]);

  useEffect(() => {
    loadAssets();
  }, [sourceChainId, destChainId]);

  useEffect(() => {
    const fetchAssetBalance = async (
      chainId: number,
      tokenId: string,
      account: string,
      callback: (_value: bigint) => void
    ): Promise<void> => {
      try {
        const provider = new WsProvider(networks[chainId].rpcUrls[0]);
        const api = new ApiPromise({ provider });

        await api.isReady;

        const res = await api.query.assets?.account(tokenId, account);
        if (res.isEmpty) callback(ZERO);
        else callback(BigInt(res.toString()));
      } catch {
        callback(ZERO);
      }
    };
    const fetchBalances = async () => {
      if (sourceChainId === undefined || !activeAccount) return;

      setLoadingBalance(true);

      await fetchAssetBalance(
        sourceChainId,
        tokenId,
        activeAccount.address,
        (value) => setSourceBalance(value)
      );

      setLoadingBalance(false);
    };

    fetchBalances();
  }, [tokenId]);

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
            {Object.entries(networks).map(([chainId, network], index) => (
              <MenuItem value={chainId} key={index}>
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
            {Object.entries(networks).map(([chainId, network], index) => (
              <MenuItem value={chainId} key={index}>
                {network.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        {canWork &&
          (assets.length > 0 ? (
            <FormControl fullWidth className='form-item'>
              <FormLabel>Select asset to transfer</FormLabel>
              <Select
                value={tokenId || ''}
                onChange={(e) => setTokenId(e.target.value)}
              >
                {assets.map((asset, index) => (
                  <MenuItem value={asset.asset.Token} key={index}>
                    {asset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <div>There are no assets supported on both networks.</div>
          ))}
        {canWork && !loadingBalance && tokenId && (
          <div className={styles.balanceContainer}>
            <div>Balance: </div>
            <div>{sourceBalance.toString()}</div>
          </div>
        )}
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingAssets || loadingBalance}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </Box>
  );
};

export default TransferPage;
