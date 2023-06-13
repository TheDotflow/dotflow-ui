import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from '@mui/material';
import {
  contractQuery,
  decodeOutput,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { AddressCard } from '@/components/AddressCard';

import { useIdentity } from '@/contracts';

interface NetworkAddress {
  network: string;
  address: string;
}

const IdentityPage = () => {
  const { api } = useInkathon();
  const { contract, identityNo, getNetworkName } = useIdentity();
  const [addresses, setAddresses] = useState<Array<NetworkAddress>>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    if (!api || !contract || identityNo === null) {
      setAddresses([]);
      return;
    }
    try {
      setLoading(true);

      const result = await contractQuery(api, '', contract, 'identity', {}, [
        identityNo,
      ]);
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'identity'
      );
      if (isError) throw new Error(decodedOutput);
      const records = output.addresses;
      const _addresses: Array<NetworkAddress> = [];
      for (let idx = 0; idx < records.length; ++idx) {
        const record = records[idx];
        const networkId = record[0];
        const address = record[1];
        const network = (await getNetworkName(networkId)) as string;
        _addresses.push({
          network,
          address,
        });
      }
      setAddresses(_addresses);
    } catch (e) {
      console.log(e);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAddresses();
  }, [identityNo]);

  const onCreateIdentity = () => {
    // TODO:
  };

  const onAddAddress = () => {
    // TODO:
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
        <Button
          variant='contained'
          className='btn-primary'
          startIcon={<AddIcon />}
          onClick={identityNo === null ? onCreateIdentity : onAddAddress}
        >
          {identityNo === null ? 'Create Identity' : 'Add New Address'}
        </Button>
      </Box>
      {identityNo === null ? (
        <Typography variant='h5'>
          {"You don't have an identity yet."}
        </Typography>
      ) : loading ? (
        <Box className='loading-spinner'>
          <CircularProgress size='64px' />
        </Box>
      ) : (
        <>
          <Typography className='section-header'>{`Wallet Addresses(${addresses.length})`}</Typography>
          <Grid container spacing={2} columns={{ xs: 1, sm: 2, md: 3 }}>
            <Grid item>
              {addresses.map(({ network, address }, index) => (
                <AddressCard
                  key={index}
                  name={network}
                  address={address}
                  onCopy={() => setAlertOpen(true)}
                />
              ))}
            </Grid>
          </Grid>
        </>
      )}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity='success'
          sx={{ width: '100%' }}
        >
          Address copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
};

export default IdentityPage;
