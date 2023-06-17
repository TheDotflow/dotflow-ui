import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Box, Card, IconButton, Typography } from '@mui/material';
import { contractTx, useInkathon } from '@scio-labs/use-inkathon';
import { useConfirm } from 'material-ui-confirm';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import { clipAddress } from '@/utils';
import IdentityKey from '@/utils/identityKey';

import { LOCAL_STORAGE_KEY } from '@/consts';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';
import { Address, NetworkId } from '@/contracts/types';

import styles from './index.module.scss';
interface AddressCardProps {
  data: Address;
  onEdit?: () => void;
}

export const AddressCard = ({ data, onEdit }: AddressCardProps) => {
  const confirm = useConfirm();
  const { api, activeAccount } = useInkathon();
  const { toastSuccess, toastError } = useToast();
  const { networks, contract, fetchAddresses } = useIdentity();

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
        `Failed to remove address. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
    }
    setWorking(false);
  };

  const decryptAddress = (address: string, networkId: number): string => {
    const identityKey = localStorage.getItem(LOCAL_STORAGE_KEY) || '';

    let decryptedAddress = address;
    if (IdentityKey.containsNetworkId(identityKey, networkId)) {
      decryptedAddress = IdentityKey.decryptAddress(
        identityKey,
        networkId,
        address
      );
    }

    return decryptedAddress;
  };

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
          {clipAddress(decryptAddress(address, networkId))}
        </Typography>
      </Box>
      <Box
        sx={{
          gap: '32px',
          display: 'flex',
          marginRight: 0,
        }}
      >
        <CopyToClipboard
          text={address}
          onCopy={() => toastSuccess('Address copied to clipboard.')}
        >
          <Box className={styles.actionBtn}>
            <ContentCopyIcon />
            <Typography>Copy Address</Typography>
          </Box>
        </CopyToClipboard>
        <Box className={styles.actionBtn}>
          <ShareOutlinedIcon />
          <Typography>Share Address</Typography>
        </Box>
        <IconButton
          onClick={() => {
            confirm({
              description:
                'This will remove your address and cannot be undone.',
            }).then(() => removeAddress(networkId));
          }}
          disabled={working}
        >
          <DeleteOutlineOutlinedIcon />
        </IconButton>
      </Box>
    </Card>
  );
};
