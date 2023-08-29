import {
  Alert,
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
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { useInkathon } from '@scio-labs/use-inkathon';
import styles from '@styles/pages/transfer.module.scss';
import { useCallback, useEffect, useState } from 'react';
import { AccountType } from 'types/types-arguments/identity';

import AssetRegistry, { Asset } from '@/utils/assetRegistry';
import IdentityKey from '@/utils/identityKey';
import KeyStore from '@/utils/keyStore';
import TransactionRouter, { isTeleport } from '@/utils/transactionRouter';
import { getTeleportableAssets } from '@/utils/transactionRouter/teleportableRoutes';
import { Fungible } from '@/utils/transactionRouter/types';

import { chainsSupportingXcmExecute, RELAY_CHAIN } from '@/consts';
import { useRelayApi } from '@/contexts/RelayApi';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { useAddressBook } from '@/contracts/addressbook/context';
import { LoadingButton } from '@mui/lab';

const TransferPage = () => {
  const {
    chains,
    getAddresses,
    contract: identityContract,
  } = useIdentity();
  const { activeAccount, activeSigner } = useInkathon();
  const { toastError } = useToast();
  const { identities } = useAddressBook();

  const [sourceChainId, setSourceChainId] = useState<number>();
  const [destChainId, setDestChainId] = useState<number>();
  const {
    state: { api: relayApi },
  } = useRelayApi();

  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>();
  const [recipientId, setRecipientId] = useState<number>();
  const [recipientOk, setRecipientOk] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [transferring, setTransferring] = useState<boolean>(false);

  const chainsSelected =
    !loadingAssets && sourceChainId !== undefined && destChainId !== undefined;
  const assetSelected = chainsSelected && Boolean(selectedAsset);

  useEffect(() => setSelectedAsset(undefined), [chainsSelected]);

  useEffect(() => setRecipientId(undefined), [assetSelected]);
  useEffect(() => setAmount(undefined), [assetSelected]);

  const canTransfer = assetSelected && recipientId !== undefined;

  const loadAssets = useCallback(async () => {
    if (sourceChainId === undefined || destChainId === undefined) return;
    setLoadingAssets(true);

    if (sourceChainId !== destChainId) {
      const hrmp = await relayApi.query.hrmp.hrmpChannels({
        sender: chains[sourceChainId].paraId,
        recipient: chains[destChainId].paraId,
      });

      if (hrmp.isEmpty && sourceChainId !== 0 && destChainId !== 0) {
        toastError(
          "There's no HRMP channel open between the source and destination chain"
        );
        setAssets([]);
      } else {
        const _assets = await AssetRegistry.assetsSupportedOnBothChains(
          RELAY_CHAIN,
          chains[sourceChainId].paraId,
          chains[destChainId].paraId
        );
        _assets.push(...getTeleportableAssets(sourceChainId, destChainId));
        setAssets(_assets);
      }
    } else {
      const _assets = await AssetRegistry.getAssetsOnBlockchain(
        RELAY_CHAIN,
        chains[sourceChainId].paraId
      );
      _assets.push(...getTeleportableAssets(sourceChainId, destChainId));
      setSelectedAsset([]);
      setAssets(_assets);
    }

    setLoadingAssets(false);
  }, [sourceChainId, destChainId]);

  useEffect(() => {
    loadAssets();
  }, [sourceChainId, destChainId]);

  useEffect(() => {
    const checkIdentity = async () => {
      if (recipientId === undefined || destChainId === undefined) return;
      const addresses = await getAddresses(identities[recipientId].identityNo);
      const index = addresses.findIndex(
        (address) => address.chainId === destChainId
      );
      setRecipientOk(index !== -1);
      if (index === -1) {
        toastError(
          `${identities[recipientId].nickName} does not have ${chains[destChainId].name} address.`
        );
      } else {
        const recepientIdentityNo = identities[recipientId].identityNo;
        const identityKey = KeyStore.readIdentityKey(recepientIdentityNo) || '';
        const destAddressRaw = addresses[index].address;
        if (IdentityKey.containsChainId(identityKey, destChainId)) {
          const decryptedAddress = IdentityKey.decryptAddress(
            identityKey,
            destChainId,
            destAddressRaw
          );
          setRecipientAddress(decryptedAddress);
        } else {
          toastError('Cannot find identity key for the recipient');
        }
      }
    };
    setRecipientOk(false);
    checkIdentity();
  }, [recipientId]);

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  const isTransferSupported = (): boolean => {
    if (
      sourceChainId === undefined ||
      destChainId === undefined ||
      selectedAsset === undefined
    ) {
      return false;
    }
    const reserveParaId = getParaIdFromXcmInterior(selectedAsset.xcmInteriorKey);
    // If the origin is the reserve chain that means that we can use the existing
    // `limitedReserveTransferAssets` or `limitedTeleportAssets` extrinsics which are
    // supported on all chains that have the xcm pallet.
    if (sourceChainId == reserveParaId && sourceChainId !== destChainId) {
      return true;
    }

    const isSourceParachain = sourceChainId > 0;

    if (
      sourceChainId !== destChainId &&
      isTeleport(sourceChainId, destChainId, getFungible(selectedAsset.xcmInteriorKey, isSourceParachain, 0))
    ) {
      return true;
    }

    const isOriginSupportingLocalXCM = chainsSupportingXcmExecute.findIndex(
      (chain) => chain.paraId == sourceChainId && chain.relayChain == RELAY_CHAIN
    );

    // We only need the origin chain to support XCM for any other type of transfer to
    // work.
    if (isOriginSupportingLocalXCM >= 0) {
      return true;
    }

    return false;
  };

  const transferAsset = async () => {
    if (
      recipientAddress === undefined ||
      destChainId === undefined ||
      identityContract === undefined ||
      sourceChainId === undefined ||
      activeAccount === undefined ||
      selectedAsset === undefined ||
      amount === undefined
    ) {
      return;
    }

    const reserveChainId = getParaIdFromXcmInterior(selectedAsset.xcmInteriorKey);

    const count = Math.min(
      chains[sourceChainId].rpcUrls.length,
      chains[destChainId].rpcUrls.length,
      chains[reserveChainId].rpcUrls.length
    );

    const rpcIndex = Math.min(Math.floor(Math.random() * count), count - 1);

    const isSourceParachain = sourceChainId > 0;

    const keypair = new Keyring();
    keypair.addFromAddress(activeAccount.address);

    const receiverKeypair = new Keyring();
    receiverKeypair.addFromAddress(recipientAddress);

    setTransferring(true);

    await TransactionRouter.sendTokens(
      {
        keypair: keypair.pairs[0], // How to convert active account into a keypair?
        chain: sourceChainId,
      },
      {
        addressRaw: receiverKeypair.pairs[0].publicKey,
        chain: destChainId,
        type:
          chains[destChainId].accountType === 'AccountId32'
            ? AccountType.accountId32
            : AccountType.accountKey20,
      },
      reserveChainId,
      getFungible(selectedAsset.xcmInteriorKey, isSourceParachain, amount * Math.pow(10, selectedAsset.decimals)),
      {
        originApi: await getApi(chains[sourceChainId].rpcUrls[rpcIndex]),
        destApi: await getApi(chains[destChainId].rpcUrls[rpcIndex]),
        reserveApi: await getApi(chains[reserveChainId].rpcUrls[rpcIndex]),
      },
      activeSigner
    );

    setTransferring(false);
  };

  const getParaIdFromXcmInterior = (xcmInterior: any): number => {
    if (xcmInterior.length > 1 && Object.hasOwn(xcmInterior[1], 'parachain')) {
      return xcmInterior[1].parachain;
    } else {
      return 0;
    }
  };

  const getApi = async (rpc: string): Promise<ApiPromise> => {
    const provider = new WsProvider(rpc);
    const api = await ApiPromise.create({ provider });
    return api;
  };

  const getFungible = (xcmInterior: any, isSourceParachain: boolean, amount: number): Fungible => {
    xcmInterior = Array.isArray(xcmInterior) ? xcmInterior : JSON.parse(xcmInterior.toString());
    return {
      multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
        xcmInterior,
        isSourceParachain,
        sourceChainId
      ),
      amount,
    };
  }

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
            {Object.entries(chains).map(([chainId, network], index) => (
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
            {Object.entries(chains).map(([chainId, network], index) => (
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
                value={selectedAsset || ''}
                onChange={(e: any) => setSelectedAsset(e.target.value)}
              >
                {assets.map((asset, index) => (
                  <MenuItem value={asset} key={index}>
                    {asset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <div>There are no assets supported on both chains.</div>
          ))}
        {assetSelected && (
          <FormControl fullWidth className='form-item'>
            <FormLabel>Select recipient</FormLabel>
            <Select
              value={recipientId === undefined ? '' : recipientId}
              onChange={(e) => setRecipientId(Number(e.target.value))}
            >
              {identities.map((identity, index) => (
                <MenuItem value={index} key={index}>
                  {identity.nickName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {canTransfer && (
          <>
            <TextField
              value={amount || ''}
              type='number'
              placeholder={`amount in ${selectedAsset.symbol}`}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
            {!isTransferSupported() &&
              <Alert severity="warning">This transfer route is currently not supported.</Alert>
            }
            <LoadingButton
              fullWidth
              variant='contained'
              disabled={!recipientOk || !isTransferSupported()}
              onClick={transferAsset}
              loading={transferring}
              loadingPosition='center'
            >
              Transfer
            </LoadingButton>
          </>
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
