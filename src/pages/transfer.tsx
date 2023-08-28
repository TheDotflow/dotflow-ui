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
import styles from '@styles/pages/transfer.module.scss';
import { useCallback, useEffect, useState } from 'react';

import AssetRegistry, { Asset } from '@/utils/assetRegistry';
import IdentityKey from '@/utils/identityKey';
import KeyStore from '@/utils/keyStore';

import { chainsSupportingXcmExecute, RELAY_CHAIN } from '@/consts';
import { useRelayApi } from '@/contexts/RelayApi';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { useAddressBook } from '@/contracts/addressbook/context';
import TransactionRouter from '@/utils/transactionRouter';
import { useInkathon } from '@scio-labs/use-inkathon';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { AccountType } from 'types/types-arguments/identity';

const TransferPage = () => {
  const {
    chains,
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
  const [selectedAssetXcmInterior, setSelectedXcmInterior] = useState<any[]>();
  // const [loadingBalance, setLoadingBalance] = useState(false);
  // const [sourceBalance, setSourceBalance] = useState<bigint>(ZERO);
  const [recipientId, setRecipientId] = useState<number>();
  const [recipientOk, setRecipientOk] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [amount, setAmount] = useState<number>();

  const chainsSelected =
    !loadingAssets && sourceChainId !== undefined && destChainId !== undefined;
  const assetSelected = chainsSelected && Boolean(selectedAssetXcmInterior);

  useEffect(() => setSelectedXcmInterior(undefined), [chainsSelected]);

  useEffect(() => setRecipientId(undefined), [assetSelected]);
  useEffect(() => setAmount(undefined), [assetSelected]);

  const loadAssets = useCallback(async () => {
    if (sourceChainId === undefined || destChainId === undefined) return;
    setLoadingAssets(true);

    if (sourceChainId !== destChainId) {
      const hrmp = await relayApi.query.hrmp.hrmpChannels({
        sender: chains[sourceChainId].paraId,
        recipient: chains[destChainId].paraId,
      });

      if (hrmp.isEmpty) {
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
        setAssets(_assets);
      }
    } else {
      const _assets = await AssetRegistry.getAssetsOnBlockchain(
        RELAY_CHAIN,
        chains[sourceChainId].paraId
      );
      setSelectedXcmInterior([]);
      setAssets(_assets);
    }

    setLoadingAssets(false);
  }, [sourceChainId, destChainId]);

  useEffect(() => {
    loadAssets();
  }, [sourceChainId, destChainId]);

  // useEffect(() => {
  //   const fetchAssetBalance = async (
  //     chainId: number,
  //     selectedAssetXcmInterior: string,
  //     account: string,
  //     callback: (_value: bigint) => void
  //   ): Promise<void> => {
  //     try {
  //       const provider = new WsProvider(chains[chainId].rpcUrls[0]);
  //       const api = new ApiPromise({ provider });

  //       await api.isReady;

  //       const res = await api.query.assets?.account(selectedAssetXcmInterior, account);
  //       if (res.isEmpty) callback(ZERO);
  //       else callback(BigInt(res.toString()));

  //       await api.disconnect();
  //     } catch {
  //       callback(ZERO);
  //     }
  //   };
  //   const fetchBalances = async () => {
  //     if (
  //       sourceChainId === undefined ||
  //       !activeAccount ||
  //       selectedAssetXcmInterior === undefined
  //     )
  //       return;

  //     setLoadingBalance(true);

  //     await fetchAssetBalance(
  //       sourceChainId,
  //       selectedAssetXcmInterior,
  //       activeAccount.address,
  //       (value) => setSourceBalance(value)
  //     );

  //     setLoadingBalance(false);
  //   };

  //   fetchBalances();
  // }, [selectedAssetXcmInterior]);

  useEffect(() => {
    if (sourceChainId === undefined) return;
    const index = addresses.findIndex(
      (address) => address.chainId === sourceChainId
    );
    index === -1 &&
      toastError(`You don't have ${chains[sourceChainId].name} address`);
  }, [sourceChainId]);

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
  const isTransferSupported = (
    originParaId: number,
    reserveParaId: number
  ): boolean => {
    // If the origin is the reserve chain that means that we can use the existing
    // `limitedReserveTransferAssets` or `limitedTeleportAssets` extrinsics which are
    // supported on all chains that have the xcm pallet.
    if (originParaId == reserveParaId) {
      return true;
    }

    const isOriginSupportingLocalXCM = chainsSupportingXcmExecute.findIndex(
      (chain) => chain.paraId == originParaId && chain.relayChain == RELAY_CHAIN
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
      selectedAssetXcmInterior === undefined ||
      amount === undefined
    ) {
      return;
    }

    const reserveChainId = getParaIdFromXcmInterior(selectedAssetXcmInterior);

    const count = Math.min(
      chains[sourceChainId].rpcUrls.length,
      chains[destChainId].rpcUrls.length,
      chains[reserveChainId].rpcUrls.length
    );

    const rpcIndex = Math.min(Math.floor(Math.random() * count), count - 1);

    const isSourceParachain = sourceChainId > 0;

    const textEncoder = new TextEncoder();
    const addressRaw = textEncoder.encode(recipientAddress);

    const keypair = new Keyring();
    keypair.addFromAddress(activeAccount.address);

    await TransactionRouter.sendTokens(
      {
        keypair: keypair.pairs[0], // How to convert active account into a keypair?
        chain: sourceChainId
      },
      {
        addressRaw,
        chain: destChainId,
        type: chains[destChainId].accountType === "AccountId32" ? AccountType.accountId32 : AccountType.accountKey20
      },
      0,
      {
        multiAsset: AssetRegistry.xcmInteriorToMultiAsset(
          selectedAssetXcmInterior,
          isSourceParachain,
          sourceChainId
        ),
        amount
      },
      {
        originApi: await getApi(chains[sourceChainId].rpcUrls[rpcIndex]),
        destApi: await getApi(chains[destChainId].rpcUrls[rpcIndex]),
        reserveApi: await getApi(chains[reserveChainId].rpcUrls[rpcIndex])
      }
    )
  };

  const getParaIdFromXcmInterior = (xcmInterior: any[]): number => {
    if (xcmInterior[1].hasOwnProperty('parachain')) {
      return xcmInterior[1].parachain;
    } else {
      return 0;
    }
  }

  const getApi = async (rpc: string): Promise<ApiPromise> => {
    const provider = new WsProvider(rpc);
    const api = await ApiPromise.create({ provider });
    return api;
  }

  const canTransfer = assetSelected && recipientId !== undefined && isTransferSupported(sourceChainId, destChainId);

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
                value={selectedAssetXcmInterior || ''}
                onChange={(e: any) => setSelectedXcmInterior(e.target.value)}
              >
                {assets.map((asset, index) => (
                  <MenuItem value={asset.xcmInteriorKey} key={index}>
                    {asset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <div>There are no assets supported on both chains.</div>
          ))}
        {/* {assetSelected && !loadingBalance && (
          <div className={styles.balanceContainer}>
            <div>Balance: </div>
            <div>{sourceBalance.toString()}</div>
          </div>
        )} */}
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
              placeholder='amount in selected token'
              type='number'
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
            <Button
              fullWidth
              variant='contained'
              disabled={!recipientOk}
              onClick={transferAsset}
            >
              Transfer
            </Button>
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
