import { Box, Typography } from '@mui/material';

import { CreateAddressBook, RemoveAddressBook } from '@/components/Buttons';

import { useAddressBook } from '@/contracts/addressbook/context';

const AddressBookPage = () => {
  const { hasAddressBook } = useAddressBook();
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
              <RemoveAddressBook />
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AddressBookPage;
