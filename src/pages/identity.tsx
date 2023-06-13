import AddIcon from '@mui/icons-material/Add';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
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
  contractTx,
  decodeOutput,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { useConfirm } from 'material-ui-confirm';
import { useEffect, useState } from 'react';

import { AddressCard } from '@/components/AddressCard';

import { useIdentity } from '@/contracts';

interface NetworkAddress {
  network: string;
  address: string;
}

const IdentityPage = () => {
  const { api, activeAccount } = useInkathon();
  const { contract, identityNo, getNetworkName, fetchIdentityNo } =
    useIdentity();
  const [addresses, setAddresses] = useState<Array<NetworkAddress>>([]);
  const [alert, setAlert] = useState('');
  const [alertOpen, showAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [errorOpen, showError] = useState(false);

  const confirm = useConfirm();

  const toastError = (errorMsg: string) => {
    setError(errorMsg);
    showError(true);
  };

  const toastSuccess = (msg: string) => {
    setAlert(msg);
    showAlert(true);
  };

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

  const onCreateIdentity = async () => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot create identity. Please check if you are connected to the network'
      );
      return;
    }
    setCreating(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'create_identity',
        {},
        []
      );

      toastSuccess('Successfully created your identity.');
      fetchIdentityNo();
    } catch (e: any) {
      toastError(
        `Failed to create identity. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
    } finally {
      setCreating(false);
    }
  };

  const removeIdentity = async () => {
    if (!api || !activeAccount || !contract) {
      toastError(
        'Cannot remove identity. Please check if you are connected to the network'
      );
      return;
    }
    setRemoving(true);
    try {
      await contractTx(
        api,
        activeAccount.address,
        contract,
        'remove_identity',
        {},
        []
      );

      toastSuccess('Successfully removed your identity.');
      fetchIdentityNo();
    } catch (e: any) {
      toastError(
        `Failed to remove identity. Error: ${
          e.errorMessage === 'Error'
            ? 'Please check your balance.'
            : e.errorMessage
        }`
      );
    } finally {
      setRemoving(false);
    }
  };

  const onRemoveIdentity = () => {
    confirm({
      description:
        'This will permanently remove your identity and you will lose all the addresses stored on chain.',
    }).then(removeIdentity);
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
        <Box sx={{ display: 'flex', gap: '16px' }}>
          {identityNo === null && (
            <Button
              variant='contained'
              className='btn-primary'
              startIcon={creating ? <></> : <AddIcon />}
              onClick={onCreateIdentity}
              disabled={creating}
              sx={{ gap: !creating ? 0 : '8px' }}
            >
              {creating && <CircularProgress size='16px' />}
              Create Identity
            </Button>
          )}
          {identityNo !== null && (
            <Button
              variant='contained'
              className='btn-primary'
              startIcon={removing ? <></> : <DeleteRoundedIcon />}
              onClick={onRemoveIdentity}
              disabled={removing}
              sx={{ gap: !removing ? 0 : '8px' }}
            >
              {removing && <CircularProgress size='16px' />}
              Remove Identity
            </Button>
          )}
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
                  onCopy={() => {
                    setAlert('Address copied to clipboard');
                    showAlert(true);
                  }}
                />
              ))}
            </Grid>
          </Grid>
        </>
      )}
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => showAlert(false)}
      >
        <Alert
          onClose={() => showAlert(false)}
          severity='success'
          sx={{ width: '100%' }}
          variant='filled'
        >
          {alert}
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorOpen}
        autoHideDuration={3000}
        onClose={() => showError(false)}
      >
        <Alert
          onClose={() => showError(false)}
          severity='error'
          variant='filled'
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default IdentityPage;
