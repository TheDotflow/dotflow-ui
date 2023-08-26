import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useConfirm } from 'material-ui-confirm';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { clipAddress } from '@/utils';
import IdentityKey from '@/utils/identityKey';
import KeyStore from '@/utils/keyStore';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { Address, NetworkId } from '@/contracts/types';

import styles from './index.module.scss';
interface AddressCardProps {
  data: Address;
  onEdit?: () => void;
}

type DecryptionResult = {
  success: boolean;
  value: string;
};

export const AddressCard = ({ data, onEdit }: AddressCardProps) => {
  const confirm = useConfirm();
  const { api, activeAccount } = useInkathon();
  const { toastSuccess, toastError } = useToast();
  const { identityNo, networks, contract, fetchAddresses } = useIdentity();

  const [working, setWorking] = useState(false);

  const { networkId, address } = data;

  const removeAddress = async (networkId: NetworkId) => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot remove address. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'remove_address',
        {},
        [networkId]
      );

      toastSuccess('Address is removed successfully.');
      fetchAddresses();
    } catch (e: any) {
      toastError(
        `Failed to remove address. Error: ${e.errorMessage === 'Error'
          ? 'Please check your balance.'
          : e.errorMessage
        }`
      );
    }
    setWorking(false);
  };

  const decryptAddress = (
    address: string,
    networkId: number
  ): DecryptionResult => {
    if (identityNo === null) return { success: false, value: '' };

    const identityKey = KeyStore.readIdentityKey(identityNo) || '';

    let decryptedAddress = address;
    if (IdentityKey.containsNetworkId(identityKey, networkId)) {
      decryptedAddress = IdentityKey.decryptAddress(
        identityKey,
        networkId,
        address
      );

      return {
        success: true,
        value: decryptedAddress,
      };
    }

    return {
      success: false,
      value: '',
    };
  };

  const addressDecrypted = decryptAddress(address, networkId);

  return (
    <Card className={styles.addressCard}>
      <Box className={styles.networkName}>
        <Typography sx={{ fontWeight: 600 }}>
          {networks[networkId].name}
        </Typography>
        <IconButton size='small' onClick={onEdit}>
          <EditRoundedIcon />
        </IconButton>
      </Box>
      <Box>
        <Typography>
          {addressDecrypted.success
            ? clipAddress(addressDecrypted.value)
            : 'Decryption failed'}
        </Typography>
      </Box>
      <Box className={styles.buttonsContainer}>
        <CopyToClipboard
          text={addressDecrypted.value}
          onCopy={() => toastSuccess('Address copied to clipboard.')}
        >
          <Box className={styles.actionBtn}>
            <ContentCopyIcon />
            <Typography>Copy Address</Typography>
          </Box>
        </CopyToClipboard>
        <IconButton
          onClick={() => {
            confirm({
              description:
                'This will remove your address and cannot be undone.',
            }).then(() => removeAddress(networkId));
          }}
          disabled={working}
        >
          {working ? (
            <CircularProgress size={24} />
          ) : (
            <DeleteOutlineOutlinedIcon />
          )}
        </IconButton>
      </Box>
    </Card>
  );
};
