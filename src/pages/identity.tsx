import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import IdentityKey from '@/utils/identityKey';

import { AddressCard } from '@/components/AddressCard';
import { CreateIdentity } from '@/components/Buttons/CreateIdentity';
import { RemoveIdentity } from '@/components/Buttons/RemoveIdentity';
import { AddAddressModal, EditAddressModal } from '@/components/Modals';

import { useIdentity } from '@/contracts';

const IdentityPage = () => {
  const { identityNo, addresses, fetchAddresses } = useIdentity();

  const [newAddrModal, openAddAddr] = useState(false);

  const [networkId, setNetworkId] = useState<number | undefined>(undefined);
  const [editModalOpen, openEditModal] = useState(false);

  const onAddAddress = () => {
    openAddAddr(true);
  };

  const decryptAddress = (address: string, networkId: number): string => {
    const identityKey = localStorage.getItem("identity-key") || "";

    let decryptedAddress = address;
    if (IdentityKey.containsNetworkId(identityKey, networkId)) {
      decryptedAddress = IdentityKey.decryptAddress(identityKey, networkId, address);
    }

    return decryptedAddress;
  }

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
            {addresses.map((item, index) => (
              <Grid item key={index}>
                <AddressCard
                  data={{address: decryptAddress(item.address, item.networkId), networkId: item.networkId}}
                  onEdit={() => {
                    setNetworkId(item.networkId);
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
    </>
  );
};

export default IdentityPage;
