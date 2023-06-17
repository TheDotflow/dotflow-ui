import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import IdentityKey from '@/utils/identityKey';

import { LOCAL_STORAGE_KEY } from '@/consts';
import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

import styles from './index.module.scss';

interface ShareIdentityModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShareIdentityModal = ({
  open,
  onClose,
}: ShareIdentityModalProps) => {
  const { identityNo, addresses, networks } = useIdentity();
  const { toastSuccess } = useToast();
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [sharedKey, setSharedKey] = useState('');

  useEffect(() => {
    const selectedNetworks = Object.entries(checks)
      .filter((item) => item[1])
      .map((item) => Number(item[0]));

    let _sharedKey = '';

    selectedNetworks.forEach((networkId) => {
      let identityKey = localStorage.getItem(LOCAL_STORAGE_KEY) || '';

      if (!IdentityKey.containsNetworkId(identityKey, networkId)) {
        identityKey = IdentityKey.newCipher(identityKey, networkId);
        localStorage.setItem(LOCAL_STORAGE_KEY, identityKey);
      }
      _sharedKey += `${networkId}:${IdentityKey.getNetworkCipher(
        identityKey,
        networkId
      )};`;
    });
    setSharedKey(_sharedKey);
  }, [checks]);

  useEffect(() => setChecks({}), [open]);

  return identityNo === null ? (
    <></>
  ) : (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Share Identity</DialogTitle>
        <DialogContent>
          <Box className={styles.identityNo}>
            <Typography>{`Identity No: ${identityNo}`}</Typography>
            <CopyToClipboard
              text={identityNo.toString()}
              onCopy={() => toastSuccess('Identity no copied to clipboard.')}
            >
              <IconButton>
                <ContentCopyIcon />
              </IconButton>
            </CopyToClipboard>
          </Box>
          <Grid container sx={{ pt: '12px', pb: '24px' }}>
            {addresses.map(({ networkId }, index) => (
              <Grid item key={index} sx={{ flexGrow: 1 }}>
                <FormControlLabel
                  label={networks[networkId].name}
                  control={
                    <Checkbox
                      onChange={(e) =>
                        setChecks({
                          ...checks,
                          [networkId]: e.target.checked,
                        })
                      }
                    />
                  }
                />
              </Grid>
            ))}
          </Grid>
          <Box className={styles.copyIdentityKey}>
            <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
              Copy Identity Key
            </Typography>
            <CopyToClipboard
              text={sharedKey}
              onCopy={() => toastSuccess('Identity key copied to clipboard.')}
            >
              <IconButton>
                <ContentCopyIcon />
              </IconButton>
            </CopyToClipboard>
          </Box>
          <Typography color='primary' align='center'>
            {'This identity key has to be sent alongside the identity no.'}
            <br />
            {"Without it, the receiver won't have access to your addresses"}
          </Typography>
          <Button
            className='btn-ok'
            variant='contained'
            onClick={onClose}
            sx={{ mt: '24px' }}
          >
            Close
          </Button>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
