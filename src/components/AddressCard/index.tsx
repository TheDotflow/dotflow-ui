import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Box, Card, IconButton, Typography } from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import styles from './index.module.scss';
interface AddressCardProps {
  name: string;
  address: string;
  onCopy?: (_address: string | undefined) => void;
}

export const AddressCard = ({ name, address, onCopy }: AddressCardProps) => {
  return (
    <Card className={styles.addressCard}>
      <Box className={styles.networkName}>
        {name}
        <IconButton size='small'>
          <EditRoundedIcon />
        </IconButton>
      </Box>
      <Box>
        <Typography>{address}</Typography>
      </Box>
      <Box
        sx={{
          gap: '32px',
          display: 'flex',
          marginRight: { md: '32px', sm: '16px' },
        }}
      >
        <CopyToClipboard
          text={address}
          onCopy={() => onCopy && onCopy(address)}
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
      </Box>
    </Card>
  );
};
