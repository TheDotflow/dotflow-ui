import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  FormLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { useInkathon } from '@scio-labs/use-inkathon';
import styles from '@styles/pages/transfer.module.scss';
import { Chaindata } from 'chaindata';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AccountType } from 'types/types-arguments/identity';

import AssetRegistry, { Asset } from '@/utils/assetRegistry';
import IdentityKey from '@/utils/identityKey';
import KeyStore from '@/utils/keyStore';
import NativeTransfer from '@/utils/nativeTransfer';
import TransactionRouter, { isTeleport } from '@/utils/xcmTransfer';
import { getTeleportableAssets } from '@/utils/xcmTransfer/teleportableRoutes';
import { Fungible } from '@/utils/xcmTransfer/types';

import { chainsSupportingXcmExecute } from '@/consts';
import { RelayContextProvider, useRelay, useRelayApi } from '@/contexts/RelayApi';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { useAddressBook } from '@/contracts/addressbook/context';

const TransferPage = () => {
  const {
    chains,
    getAddresses,
    contract: identityContract,
    loading: loadingIdentity,
  } = useIdentity();
  const { activeAccount, activeSigner } = useInkathon();
  const { toastError, toastSuccess } = useToast();
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

  const { relay } = useRelay();

  const chainsSelected =
    !loadingAssets && sourceChainId !== undefined && destChainId !== undefined;
  const assetSelected = chainsSelected && Boolean(selectedAsset);

  useEffect(() => setSelectedAsset(undefined), [chainsSelected]);

  useEffect(() => setRecipientId(undefined), [assetSelected]);
  useEffect(() => setAmount(undefined), [assetSelected]);

  const canTransfer = assetSelected && recipientId !== undefined;

  const loadAssets = useCallback(async () => {
    if (!relayApi) return;

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
          relay,
          chains[sourceChainId].paraId,
          chains[destChainId].paraId
        );
        _assets.push(...getTeleportableAssets(sourceChainId, destChainId, relay));
        setAssets(_assets);
      }
    } else {
      const chaindata = new Chaindata();
      const chain = await chaindata.getChain(sourceChainId, relay);

      await chaindata.load();

      const _assets = [];
      if (chain) {
        const tokens = chaindata.getTokens().filter((token) => {
          const prefix = `${chain.id}-${token.data.type}`;
          const isPartOfSourceChain = token.data.id.startsWith(prefix);
          return isPartOfSourceChain;
        });
        const assets: Asset[] = tokens.map(t => {
          const asset: Asset = {
            asset: "",
            assetId: t.data?.assetId,
            onChainId: t.data?.onChainId,
            name: t.data.symbol,
            symbol: t.data.symbol,
            decimals: t.data.decimals,
            type: t.data.type,
            confidence: 0,
            inferred: false
          };
          return asset;
        });
        _assets.push(...assets);
      }

      setSelectedAsset([]);
      setAssets(_assets);
    }

    setLoadingAssets(false);
  }, [sourceChainId, destChainId, relayApi]);

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
        if (IdentityKey.containsChainId(identityKey, destChainId, relay)) {
          const decryptedAddress = IdentityKey.decryptAddress(
            identityKey,
            destChainId,
            relay,
            destAddressRaw,
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
    // We support simple transfers.
    if (sourceChainId === destChainId) {
      return true;
    }

    if (
      sourceChainId === undefined ||
      destChainId === undefined ||
      selectedAsset === undefined ||
      selectedAsset.xcmInteriorKey === undefined
    ) {
      return false;
    }
    const reserveParaId = getParaIdFromXcmInterior(
      selectedAsset.xcmInteriorKey
    );
    // If the origin is the reserve chain that means that we can use the existing
    // `limitedReserveTransferAssets` or `limitedTeleportAssets` extrinsics which are
    // supported on all chains that have the xcm pallet.
    if (sourceChainId == reserveParaId && sourceChainId !== destChainId) {
      return true;
    }

    // Even if it is we want to get the perspective from the relay chain.
    const isSourceParachain = false;

    if (
      sourceChainId !== destChainId &&
      isTeleport(
        sourceChainId,
        destChainId,
        getFungible(selectedAsset.xcmInteriorKey, isSourceParachain, 0),
        relay
      )
    ) {
      return true;
    }

    const isOriginSupportingLocalXCM = chainsSupportingXcmExecute.findIndex(
      (chain) =>
        chain.paraId == sourceChainId && chain.relayChain == relay
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

    if (amount === 0) {
      toastError("Transfer amount must be greater than 0");
      return;
    }

    if (Number.isNaN(amount)) {
      toastError("Amount must be specified")
      return;
    }

    if (countDecimalDigits(amount) > selectedAsset.decimals) {
      toastError(`The asset can have only ${selectedAsset.decimals} decimals`);
      return;
    }

    if (sourceChainId === destChainId) {
      // Just do a simple token transfer.
      const api = await getApi(chains[sourceChainId].rpc);

      const keypair = new Keyring();
      keypair.addFromAddress(activeAccount.address);

      const receiverKeypair = new Keyring();
      receiverKeypair.addFromAddress(recipientAddress);

      setTransferring(true);

      try {
        await NativeTransfer.transfer(
          api,
          keypair.pairs[0],
          selectedAsset,
          receiverKeypair.pairs[0].publicKey,
          amount * Math.pow(10, selectedAsset.decimals),
          activeSigner
        );
        toastSuccess(`Transfer succeeded`);
      } catch (e: any) {
        toastError(`Transfer failed. Error: ${e.toString()}`);
      } finally {
        setTransferring(false);
      }

      return;
    }

    const reserveChainId = getParaIdFromXcmInterior(
      selectedAsset.xcmInteriorKey
    );

    const isSourceParachain = sourceChainId > 0;

    const keypair = new Keyring();
    keypair.addFromAddress(activeAccount.address);

    const receiverKeypair = new Keyring();
    receiverKeypair.addFromAddress(recipientAddress);

    setTransferring(true);

    try {
      await TransactionRouter.sendTokens(
        {
          keypair: keypair.pairs[0],
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
        getFungible(
          JSON.parse(JSON.stringify(selectedAsset.xcmInteriorKey)), // Make a hard copy.
          isSourceParachain,
          amount * Math.pow(10, selectedAsset.decimals)
        ),
        {
          originApi: await getApi(chains[sourceChainId].rpc),
          destApi: await getApi(chains[destChainId].rpc),
          reserveApi: await getApi(chains[reserveChainId].rpc),
        },
        relay,
        activeSigner
      );
      toastSuccess(`Transfer succeded`);
    } catch (e: any) {
      toastError(`Transfer failed. Error: ${e.toString()}`);
    }

    setTransferring(false);
  };

  const countDecimalDigits = (n: number): number => {
    const numberStr = n.toString();

    // Check for scientific notation
    if (numberStr.includes('e')) {
      const parts = numberStr.split('e');
      const decimalPart = (parts[0].split('.')[1] || '').length;
      const exponentPart = parseInt(parts[1], 10);
      return decimalPart - exponentPart;
    } else {
      const decimalPart = (numberStr.split('.')[1] || '').length;
      return decimalPart;
    }
  }

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

  const getFungible = (
    xcmInterior: any,
    isSourceParachain: boolean,
    amount: number
  ): Fungible => {
    xcmInterior = Array.isArray(xcmInterior)
      ? xcmInterior
      : JSON.parse(xcmInterior.toString());
    return {
      multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
        xcmInterior,
        isSourceParachain,
        sourceChainId
      ),
      amount,
    };
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
            {Object.entries(chains).map(([chainId, network], index) => (
              <MenuItem
                value={chainId}
                key={index}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <ListItem >
                  <ListItemIcon sx={{ mr: '8px' }}>
                    <Image src={network.logo} alt='logo' width={32} height={32} />
                  </ListItemIcon>
                  <ListItemText>
                    {network.name}
                  </ListItemText>
                </ListItem>
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
                <ListItem>
                  <ListItemIcon sx={{ mr: '8px' }}>
                    <Image src={network.logo} alt='logo' width={32} height={32} />
                  </ListItemIcon>
                  <ListItemText>
                    {network.name}
                  </ListItemText>
                </ListItem>
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
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
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
              {identities.filter(
                (identity) =>
                  IdentityKey.containsChainId(
                    KeyStore.readIdentityKey(identity.identityNo) || '', destChainId, relay
                  )).map((identity, index) => (
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
              value={amount === undefined ? '' : amount}
              type='number'
              placeholder={`amount in ${selectedAsset.symbol}`}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
            {!isTransferSupported() && (
              <Alert severity='warning'>
                This transfer route is currently not supported.
              </Alert>
            )}
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
        open={loadingAssets || loadingIdentity}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </Box>
  );
};


const TransferPageWrapped = () => {
  return (
    <RelayContextProvider>
      <TransferPage />
    </RelayContextProvider>
  )
}

export default TransferPageWrapped;
