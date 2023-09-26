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
import KeyStore from '@/utils/keyStore';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

import styles from './index.module.scss';
import { useRelay } from '@/contexts/RelayApi';

interface ShareIdentityModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShareIdentityModal = ({
  open,
  onClose,
}: ShareIdentityModalProps) => {
  const { identityNo, getAllChains } = useIdentity();
  const { toastError, toastSuccess } = useToast();
  const [chains, setChains] = useState([] as Array<{ id: number, name: string }>);
  const [checks, setChecks] = useState<Record<number, boolean>>({});
  const [sharedKey, setSharedKey] = useState('');
  const { relay } = useRelay();

  useEffect(() => {
    if (identityNo == null) {
      return;
    }

    const getChains = async () => {
      const result = await getAllChains(identityNo);
      setChains(result);
    }

    getChains();
  }, []);

  useEffect(() => {
    if (identityNo === null) return;

    const selectedChains = Object.entries(checks)
      .filter((item) => item[1])
      .map((item) => Number(item[0]));

    const identityKey = KeyStore.readIdentityKey(identityNo) || '';

    try {
      const sharedKey = IdentityKey.getSharedKey(identityKey, selectedChains, relay);
      setSharedKey(`identityNo:${identityNo};`.concat(sharedKey));
    } catch (e: any) {
      toastError(`Failed to get the identity key. Error: ${e.message}`);
    }
  }, [checks, identityNo, toastError]);

  useEffect(() => setChecks({}), [open]);

  return identityNo === null ? (
    <></>
  ) : (
    <Dialog open={open} onClose={onClose}>
      <Box className='modal-wrapper'>
        <DialogTitle>Share Identity</DialogTitle>
        <DialogContent>
          <Typography mt='2em'>
            Specify the chains that the receiver of the identity key will be
            able to access:
          </Typography>
          <Grid container sx={{ pt: '12px', pb: '24px' }} mb='1em'>
            {chains.map(({ id, name }) => (
              <Grid item key={`${id}${name}`} sx={{ flexGrow: 1 }}>
                <FormControlLabel
                  label={name}
                  control={
                    <Checkbox
                      onChange={(e) =>
                        setChecks({
                          ...checks,
                          [id]: e.target.checked,
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
            {'This identity key will be sent alongside the identity no.'}
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
