import {
  Backdrop,
  Box,
  Button,
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

import { RELAY_CHAIN, ZERO, chainsSupportingXcmExecute } from '@/consts';
import { useRelayApi } from '@/contexts/RelayApi';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { useAddressBook } from '@/contracts/addressbook/context';

const TransferPage = () => {
  const {
    networks,
    getAddresses,
    addresses,
    contract: identityContract,
  } = useIdentity();
  const { activeAccount } = useInkathon();
  const { toastError } = useToast();
  const { identities } = useAddressBook();

  const [sourceChainId, setSourceChainId] = useState<number>();
  const [destChainId, setDestChainId] = useState<number>();
  const {
    state: { api: relayApi },
  } = useRelayApi();

  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tokenId, setTokenId] = useState<string>();
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [sourceBalance, setSourceBalance] = useState<bigint>(ZERO);
  const [recipientId, setRecipientId] = useState<number>();
  const [recipientOk, setRecipientOk] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>();

  const chainsSelected =
    !loadingAssets && sourceChainId !== undefined && destChainId !== undefined;
  const assetSelected = chainsSelected && Boolean(tokenId);

  const canTransfer = assetSelected && recipientId !== undefined;

  useEffect(() => setTokenId(undefined), [chainsSelected]);

  useEffect(() => setRecipientId(undefined), [assetSelected]);

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

        await api.disconnect();
      } catch {
        callback(ZERO);
      }
    };
    const fetchBalances = async () => {
      if (
        sourceChainId === undefined ||
        !activeAccount ||
        tokenId === undefined
      )
        return;

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

  useEffect(() => {
    if (sourceChainId === undefined) return;
    const index = addresses.findIndex(
      (address) => address.networkId === sourceChainId
    );
    index === -1 &&
      toastError(`You don't have ${networks[sourceChainId].name} address`);
  }, [sourceChainId]);

  useEffect(() => {
    const checkIdentity = async () => {
      if (recipientId === undefined || destChainId === undefined) return;
      const addresses = await getAddresses(recipientId);
      const index = addresses.findIndex(
        (address) => address.networkId === destChainId
      );
      setRecipientOk(index !== -1);
      setRecipientAddress(addresses[index].address);

      index === -1 &&
        toastError(
          `${identities[recipientId].nickName} does not have ${networks[destChainId].name} address.`
        );
    };
    setRecipientOk(false);
    checkIdentity();
  }, [recipientId]);

  const isTransferSupported = (
    originParaId: number,
    reserveParaId: number,
  ): boolean => {
    // If the origin is the reserve chain that means that we can use the existing
    // `limitedReserveTransferAssets` or `limitedTeleportAssets` extrinsics which are
    // supported on all chains that have the xcm pallet.
    if (originParaId == reserveParaId) {
      return true;
    }

    const isOriginSupportingLocalXCM = chainsSupportingXcmExecute.findIndex(
      (chain) => chain.paraId == originParaId && chain.relayChain == RELAY_CHAIN,
    );

    // We only need the origin chain to support XCM for any other type of transfer to
    // work.
    if (isOriginSupportingLocalXCM) {
      return true;
    }

    return false;
  };

  const transferAsset = () => {
    if (
      recipientAddress === undefined ||
      destChainId === undefined ||
      identityContract === undefined
    ) {
      return;
    }

    /*
    await TransactionRouter.sendTokens(
      identityContract,
      {
        keypair: activeAccount,
        network: sourceChainId,
      } as Sender,
      {
        addressRaw: decodeAddress(recipientAddress),
        type: networks[destChainId].accountType,
        network: destChainId,
      } as Receiver,
      0, // Reserve paraId, FIXME
      {
        // FIXME:
        multiAsset: 0,
        amount: 1,
      }
    );
    */
  };

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
            value={sourceChainId === undefined ? '' : sourceChainId}
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
            value={destChainId === undefined ? '' : destChainId}
            onChange={(e) => setDestChainId(Number(e.target.value))}
          >
            {Object.entries(networks).map(([chainId, network], index) => (
              <MenuItem value={chainId} key={index}>
                {network.name}
              </MenuItem>
            ))}
          </TextField>
        </FormControl>
        {chainsSelected &&
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
        {assetSelected && !loadingBalance && (
          <div className={styles.balanceContainer}>
            <div>Balance: </div>
            <div>{sourceBalance.toString()}</div>
          </div>
        )}
        {assetSelected && (
          <FormControl fullWidth className='form-item'>
            <FormLabel>Select recipient</FormLabel>
            <Select
              value={recipientId || ''}
              onChange={(e) => setRecipientId(Number(e.target.value))}
            >
              {identities.map((identity, index) => (
                <MenuItem value={identity.identityNo} key={index}>
                  {identity.nickName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {canTransfer && (
          <Button
            fullWidth
            variant='contained'
            disabled={!recipientOk}
            onClick={transferAsset}
          >
            Transfer
          </Button>
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
