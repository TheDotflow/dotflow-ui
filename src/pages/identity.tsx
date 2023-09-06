import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ShareIcon from '@mui/icons-material/Share';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import styles from '@styles/pages/identity.module.scss';
import { useState } from 'react';

import { CreateIdentity, RemoveIdentity } from '@/components/Buttons';
import { AddressCard } from '@/components/Cards';
import {
  AddAddressModal,
  EditAddressModal,
  ImportKeyModal,
  RecoveryAccountModal,
  ShareIdentityModal,
} from '@/components/Modals';

import { useIdentity } from '@/contracts';

const IdentityPage = () => {
  const { identityNo, addresses, fetchAddresses, loading } = useIdentity();

  const [newAddrModal, openAddAddr] = useState(false);

  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [editModalOpen, openEditModal] = useState(false);
  const [importModalOpen, openImportModal] = useState(false);
  const [shareModalOpen, openShareModal] = useState(false);
  const [recoveryModalOpen, openRecoveryModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Box className={styles.identityContainer}>
        <Typography variant='h4' fontWeight={700}>
          My Identity
        </Typography>
        {!loading && (
          <Box sx={{ display: 'flex', gap: '16px' }}>
            {identityNo === null ? (
              <CreateIdentity />
            ) : (
              <>
                <Button
                  variant='contained'
                  sx={{ width: 260 }}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  Menu
                </Button>
                <Menu
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorEl={anchorEl}
                  onClick={() => setAnchorEl(null)}
                >
                  <MenuItem>
                    <Button
                      startIcon={<ArrowDownwardIcon />}
                      variant='outlined'
                      className='btn btn-outline-primary'
                      onClick={() => openImportModal(true)}
                    >
                      Import Identity Key
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      variant='outlined'
                      onClick={() => openRecoveryModal(true)}
                    >
                      Set Recovery Account
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <Button
                      startIcon={<ShareIcon />}
                      variant='outlined'
                      className='btn btn-outline-primary'
                      onClick={() => openShareModal(true)}
                    >
                      Share Identity
                    </Button>
                  </MenuItem>
                  <MenuItem>
                    <RemoveIdentity />
                  </MenuItem>
                  <MenuItem>
                    <Button
                      variant='contained'
                      className='btn-primary'
                      startIcon={<AddIcon />}
                      onClick={() => openAddAddr(true)}
                    >
                      Add New Address
                    </Button>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        )}
      </Box>
      {!loading &&
        (identityNo === null ? (
          <Typography variant='h5'>
            {"You don't have an identity yet."}
          </Typography>
        ) : (
          <>
            <Typography className='section-header'>{`Wallet Addresses(${addresses.length})`}</Typography>
            <Grid container spacing={2} sx={{ mt: '12px' }}>
              {addresses.map(({ address, chainId }, index) => (
                <Grid item key={index}>
                  <AddressCard
                    data={{
                      address,
                      chainId,
                    }}
                    onEdit={() => {
                      setChainId(chainId);
                      openEditModal(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
            <AddAddressModal
              open={newAddrModal}
              onClose={() => {
                openAddAddr(false);
                fetchAddresses();
              }}
            />
            <EditAddressModal
              open={editModalOpen}
              onClose={() => {
                openEditModal(false);
                fetchAddresses();
              }}
              chainId={chainId}
            />
            <ImportKeyModal
              open={importModalOpen}
              onClose={() => openImportModal(false)}
              identityNo={identityNo}
            />
            <ShareIdentityModal
              open={shareModalOpen}
              onClose={() => openShareModal(false)}
            />
            <RecoveryAccountModal
              open={recoveryModalOpen}
              onClose={() => openRecoveryModal(false)}
              identityNo={identityNo}
            />
          </>
        ))}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  );
};

export default IdentityPage;
