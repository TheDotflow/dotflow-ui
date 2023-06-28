import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ShareIcon from '@mui/icons-material/Share';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import { AddressCard } from '@/components/AddressCard';
import { CreateIdentity, RemoveIdentity } from '@/components/Buttons';
import { AddAddressModal, EditAddressModal } from '@/components/Modals';
import { ImportKeyModal } from '@/components/Modals/ImportKey';
import { ShareIdentityModal } from '@/components/Modals/ShareIdentity';

import { useIdentity } from '@/contracts';

const IdentityPage = () => {
  const { identityNo, addresses, fetchAddresses } = useIdentity();

  const [newAddrModal, openAddAddr] = useState(false);

  const [networkId, setNetworkId] = useState<number | undefined>(undefined);
  const [editModalOpen, openEditModal] = useState(false);
  const [importModalOpen, openImportModal] = useState(false);
  const [shareModalOpen, openShareModal] = useState(false);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}
      >
        <Typography variant='h4' fontWeight={700}>
          My Identity
        </Typography>
        <Box sx={{ display: 'flex', gap: '16px' }}>
          {identityNo === null ? (
            <CreateIdentity />
          ) : (
            <>
              <Button
                startIcon={<ArrowDownwardIcon />}
                variant='outlined'
                className='btn btn-outline-primary'
                onClick={() => openImportModal(true)}
              >
                Import Identity Key
              </Button>
              <Button
                startIcon={<ShareIcon />}
                variant='outlined'
                className='btn btn-outline-primary'
                onClick={() => openShareModal(true)}
              >
                Share Identity
              </Button>
              <RemoveIdentity />
              <Button
                variant='contained'
                className='btn-primary'
                startIcon={<AddIcon />}
                onClick={() => openAddAddr(true)}
              >
                Add New Address
              </Button>
            </>
          )}
        </Box>
      </Box>
      {identityNo === null ? (
        <Typography variant='h5'>
          {"You don't have an identity yet."}
        </Typography>
      ) : (
        <>
          <Typography className='section-header'>{`Wallet Addresses(${addresses.length})`}</Typography>
          <Grid container spacing={2} sx={{ mt: '12px' }}>
            {addresses.map(({ address, networkId }, index) => (
              <Grid item key={index}>
                <AddressCard
                  data={{
                    address,
                    networkId,
                  }}
                  onEdit={() => {
                    setNetworkId(networkId);
                    openEditModal(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
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
        networkId={networkId}
      />
      <ImportKeyModal
        open={importModalOpen}
        onClose={() => openImportModal(false)}
      />
      <ShareIdentityModal
        open={shareModalOpen}
        onClose={() => openShareModal(false)}
      />
    </>
  );
};

export default IdentityPage;
