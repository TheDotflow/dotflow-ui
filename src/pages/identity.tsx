import AddIcon from '@mui/icons-material/Add';
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import {
  contractQuery,
  decodeOutput,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { AddressCard } from '@/components/AddressCard';
import { CreateIdentity } from '@/components/Buttons/CreateIdentity';
import { RemoveIdentity } from '@/components/Buttons/RemoveIdentity';

import { useToast } from '@/contexts/Toast';
import { useIdentity } from '@/contracts';

interface NetworkAddress {
  network: string;
  address: string;
}

const IdentityPage = () => {
  const { api } = useInkathon();
  const { toastSuccess } = useToast();
  const { contract, identityNo, getNetworkName } = useIdentity();
  const [addresses, setAddresses] = useState<Array<NetworkAddress>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
          const address = record[1]; // FIXME: Decode address here
          const network = (await getNetworkName(networkId)) as string;
          _addresses.push({
            network,
            address,
          });
        }
        setAddresses(_addresses);
      } catch (e) {
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [api, contract, identityNo, getNetworkName]);

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
                  onCopy={() => toastSuccess('Address copied to clipboard')}
                />
              ))}
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
};

export default IdentityPage;
