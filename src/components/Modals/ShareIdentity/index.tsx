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
import CopyToClipboard from 'react-copy-to-clipboard';

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
          <Grid container columns={3} sx={{ pt: '12px', pb: '24px' }}>
            {addresses.map(({ networkId }, index) => (
              <Grid item key={index}>
                <FormControlLabel
                  label={networks[networkId].name}
                  control={<Checkbox />}
                />
              </Grid>
            ))}
          </Grid>
          <Box className={styles.copyIdentityKey}>
            <Typography sx={{ fontWeight: 700, fontSize: '18px' }}>
              Copy Identity Key
            </Typography>
            <CopyToClipboard
              text={identityNo.toString()}
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
