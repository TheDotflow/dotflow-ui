import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Network } from 'types/types-arguments/identity';

import { isValidAddress } from '@/utils';
import IdentityKey from '@/utils/identityKey';
import KeyStore from '@/utils/keyStore';

import { useRelay } from '@/contexts/RelayApi';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { ChainId } from '@/contracts/types';

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddAddressModal = ({ open, onClose }: AddAddressModalProps) => {
  const { api, activeAccount } = useInkathon();
  const { identityNo, chains, contract } = useIdentity();
  const { toastError, toastSuccess } = useToast();

  const [chainId, setChainId] = useState<ChainId | undefined>();
  const [chainAddress, setChainAddress] = useState<string | undefined>();
  const [working, setWorking] = useState(false);
  const { relay } = useRelay();

  const onSubmit = async () => {
    if (identityNo === null) {
      toastError("You don't have an identity yet.");
      return;
    }
    if (!chainAddress || chainAddress.trim().length === 0) {
      toastError('Please input your address');
      return;
    }
    if (chainId == undefined) {
      toastError('Please specify the chain');
      return;
    }

    if (!isValidAddress(chainAddress, chains[chainId].ss58Prefix)) {
      toastError('Invalid address');
      return;
    }

    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot add an address. Please check if you are connected to the chain'
      );
      return;
    }
    setWorking(true);

    let identityKey = KeyStore.readIdentityKey(identityNo) || '';

    if (!IdentityKey.containsChainId(identityKey, chainId, relay)) {
      identityKey = IdentityKey.newCipher(identityKey, chainId, relay);
      KeyStore.updateIdentityKey(identityNo, identityKey);
    }

    const encryptedAddress = IdentityKey.encryptAddress(
      identityKey,
      chainId,
      chainAddress,
      relay
    );

    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'add_address',
        {},
        [[chainId, relay === "polkadot" ? Network.polkadot : Network.kusama], encryptedAddress]
      );

      toastSuccess('Successfully added your address.');
      setWorking(false);
      onClose();
    } catch (e: any) {
      toastError(
        `Failed to add address. Error: ${e.errorMessage === 'Error'
          ? 'Please check your balance.'
          : e.errorMessage
        }`
      );
      setWorking(false);
    }
  };

  useEffect(() => {
    setChainId(undefined);
    setChainAddress(undefined);
    setWorking(false);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <Box className='form-group' component='form'>
            <FormControl className='form-item'>
              <FormLabel>List of chains</FormLabel>
              <TextField
                label='Select a chain'
                select
                sx={{ mt: '8px' }}
                required
                value={chainId === undefined ? '' : chainId}
                onChange={(e) => setChainId(Number(e.target.value))}
              >
                {Object.entries(chains).map(([id, chain], index) => (
                  <MenuItem value={id} key={index}>
                    <ListItem>
                      <ListItemIcon sx={{ mr: '8px' }}>
                        <Image src={chain.logo} alt='logo' width={32} height={32} />
                      </ListItemIcon>
                      <ListItemText>
                        {chain.name}
                      </ListItemText>
                    </ListItem>
                  </MenuItem>
                ))}
              </TextField>
              {chainId !== undefined && (
                <div>
                  <FormHelperText
                    sx={{
                      width: '100%',
                      textAlign: 'right',
                      margin: 0,
                    }}
                  >
                    <span>{`Ss58 prefix: ${chains[chainId].ss58Prefix}`}</span>
                  </FormHelperText>
                </div>
              )}
            </FormControl>
            <FormControl className='form-item'>
              <FormLabel>Address</FormLabel>
              <TextField
                placeholder='Enter address'
                inputProps={{
                  maxLength: 64,
                }}
                required
                value={chainAddress || ''}
                error={chainAddress === ''}
                onChange={(e) => setChainAddress(e.target.value)}
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
                <span>{`${(chainAddress || '').length}/64`}</span>
              </FormHelperText>
            </FormControl>
          </Box>
          <Box className='modal-buttons'>
            <LoadingButton
              className='btn-ok'
              variant='contained'
              onClick={onSubmit}
              loading={working}
            >
              Submit
            </LoadingButton>
            <Button onClick={onClose} className='btn-cancel' disabled={working}>
              Close
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
