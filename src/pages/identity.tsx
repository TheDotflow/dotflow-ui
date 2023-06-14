import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import { AddressCard } from '@/components/AddressCard';
import { CreateIdentity } from '@/components/Buttons/CreateIdentity';
import { RemoveIdentity } from '@/components/Buttons/RemoveIdentity';
import { AddAddressModal, EditAddressModal } from '@/components/Modals';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

const IdentityPage = () => {
  const { toastSuccess } = useToast();
  const { identityNo, addresses, fetchAddresses, networks } = useIdentity();

  const [newAddrModal, openAddAddr] = useState(false);

  const [networkId, setNetworkId] = useState<number | undefined>(undefined);
  const [editModalOpen, openEditModal] = useState(false);

  const onAddAddress = () => {
    openAddAddr(true);
  };

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
          {identityNo === null && <CreateIdentity />}
          {identityNo !== null && <RemoveIdentity />}
          {identityNo !== null && (
            <Button
              variant='contained'
              className='btn-primary'
              startIcon={<AddIcon />}
              onClick={onAddAddress}
            >
              Add New Address
            </Button>
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
          <Grid
            container
            spacing={2}
            columns={{ xs: 1, sm: 2, md: 3 }}
            sx={{ mt: '12px' }}
          >
            <Grid item>
              {addresses.map(({ networkId, address }, index) => (
                <AddressCard
                  key={index}
                  name={networks[networkId]}
                  address={address}
                  onCopy={() => toastSuccess('Address copied to clipboard')}
                  onEdit={() => {
                    setNetworkId(networkId);
                    openEditModal(true);
                  }}
                />
              ))}
            </Grid>
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
    </>
  );
};

export default IdentityPage;
