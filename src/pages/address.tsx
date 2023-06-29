import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useState } from 'react';

import { CreateAddressBook, RemoveAddressBook } from '@/components/Buttons';
import { IdentityCard } from '@/components/Cards';
import { AddIdentityModal, EditNicknameModal } from '@/components/Modals';

import { useAddressBook } from '@/contracts/addressbook/context';

const AddressBookPage = () => {
  const [identityModalOpen, showIdentityModal] = useState(false);
  const [editModalOpen, openEditModal] = useState(false);
  const [identityNo, setIdentityNo] = useState<number | undefined>();

  const { hasAddressBook, identities } = useAddressBook();

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
          Address Book
        </Typography>
        <Box sx={{ display: 'flex', gap: '16px' }}>
          {!hasAddressBook ? (
            <CreateAddressBook />
          ) : (
            <>
              <Button
                variant='contained'
                className='btn-primary'
                startIcon={<AddIcon />}
                onClick={() => showIdentityModal(true)}
              >
                Add Identity
              </Button>

              <RemoveAddressBook />
            </>
          )}
        </Box>
      </Box>
      {!hasAddressBook ? (
        <Typography variant='h5'>
          {"You don't have an identity yet."}
        </Typography>
      ) : (
        <>
          <Typography className='section-header'>{`Identities(${identities.length})`}</Typography>
          <Grid container spacing={2} sx={{ mt: '12px' }}>
            {identities.map((item, index) => (
              <Grid item key={index}>
                <IdentityCard
                  data={item}
                  onEdit={() => {
                    setIdentityNo(item.identityNo);
                    openEditModal(true);
                  }}
                  onImportKey={() => {
                    setIdentityNo(item.identityNo);
                    openKeyModal(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      <AddIdentityModal
        open={identityModalOpen}
        onClose={() => showIdentityModal(false)}
      />
      <EditNicknameModal
        open={editModalOpen}
        onClose={() => openEditModal(false)}
        identityNo={identityNo as number}
      />
      <ImportKeyModal
        open={keyModalOpen}
        onClose={() => openKeyModal(false)}
        identityNo={identityNo}
      />
    </>
  );
};

export default AddressBookPage;
