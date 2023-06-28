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
import CopyToClipboard from 'react-copy-to-clipboard';

import KeyStore from '@/utils/keyStore';

import { useToast } from '@/contexts/Toast';
import { useAddressBook } from '@/contracts/addressbook/context';
import { IdentityRecord } from '@/contracts/types';

import styles from './index.module.scss';

interface IdentityCardProps {
  data: IdentityRecord;
  onEdit: () => void;
}

export const IdentityCard = ({
  data: { identityNo, nickName },
  onEdit,
}: IdentityCardProps) => {
  const confirm = useConfirm();
  const [working, setWorking] = useState(false);
  const { activeAccount, api } = useInkathon();
  const { contract, fetchIdentities } = useAddressBook();
  const { toastError, toastSuccess } = useToast();

  const removeIdentity = async (identityNo: number) => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot remove identity. Please check if you are connected to the network'
      );
      return;
    }
    setWorking(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'remove_identity',
        {},
        [identityNo]
      );

      toastSuccess('Identity is removed successfully.');

      KeyStore.removeIdentityKey(identityNo);

      fetchIdentities();
    } catch (e: any) {
      toastError(
        `Failed to remove identity. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
    }
    setWorking(false);
  };

  return (
    <Card className={styles.identityCard}>
      <Box className={styles.identityName}>
        <Typography sx={{ fontWeight: 600 }}>
          {`${nickName || `Identity ${identityNo}`}`}
        </Typography>
        <IconButton size='small' onClick={onEdit}>
          <EditRoundedIcon />
        </IconButton>
      </Box>
      <Box className={styles.buttons}>
        <CopyToClipboard
          text={identityNo.toString()}
          onCopy={() => toastSuccess('Identity no copied to clipboard.')}
        >
          <Box className={styles.actionBtn}>
            <ContentCopyIcon />
            <Typography>Copy Identity No</Typography>
          </Box>
        </CopyToClipboard>
        <IconButton
          onClick={() => {
            confirm({
              description:
                'This will remove the identity from your address book and cannot be undone.',
            }).then(() => removeIdentity(identityNo));
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
