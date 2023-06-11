import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
} from '@mui/material';
import { isWalletInstalled } from '@scio-labs/use-inkathon';
import {
  allSubstrateWallets,
  SubstrateWallet,
  useInkathon,
} from '@scio-labs/use-inkathon';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

export const WalletModal = (props: WalletModalProps) => {
  const { connect, activeChain } = useInkathon();
  const onConnect = (wallet: SubstrateWallet) => {
    if (!connect) return;
    connect(activeChain, wallet);
    props.onClose();
  };
  return (
    <Dialog
      {...props}
      fullWidth
      maxWidth='sm'
      sx={{ '.MuiDialog-paper': { padding: '0 8px' } }}
    >
      <DialogTitle>Choose your wallet extension</DialogTitle>
      <DialogContent>
        <List>
          {allSubstrateWallets.map((wallet, index) => (
            <ListItemButton
              key={index}
              onClick={() => onConnect(wallet)}
              disabled={!isWalletInstalled(wallet)}
            >
              {wallet.name}
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
