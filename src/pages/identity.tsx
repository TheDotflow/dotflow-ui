import AddIcon from '@mui/icons-material/Add';
import { Box, Button, List, ListItemText, Typography } from '@mui/material';
import {
  contractQuery,
  decodeOutput,
  useContract,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { useEffect, useState } from 'react';

import { CONTRACT_IDENTITY, IdentityMetadata } from '@/contracts';

const IdentityPage = () => {
  const { api, activeAccount } = useInkathon();
  const { contract } = useContract(IdentityMetadata, CONTRACT_IDENTITY);
  const [identityNo, setIdentityNo] = useState<number | null>(null);
  const [addresses, setAddresses] = useState([]);

  const fetchIdentityNo = async () => {
    if (!api || !contract || !activeAccount) {
      setIdentityNo(null);
    } else {
      try {
        const result = await contractQuery(
          api,
          '',
          contract,
          'identity_of',
          {},
          [activeAccount.address]
        );
        const { output, isError, decodedOutput } = decodeOutput(
          result,
          contract,
          'identity_of'
        );
        if (isError) throw new Error(decodedOutput);
        setIdentityNo(Number(output));
      } catch (e) {
        setIdentityNo(null);
      }
    }
  };

  useEffect(() => {
    void fetchIdentityNo();
  }, [activeAccount, api, contract]);

  const fetchAddresses = async () => {
    if (!api || !contract || identityNo === null) {
      setAddresses([]);
      return;
    }
    try {
      const result = await contractQuery(api, '', contract, 'identity', {}, [
        identityNo,
      ]);
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'identity'
      );
      if (isError) throw new Error(decodedOutput);
      setAddresses(output.addresses);
    } catch (e) {
      setAddresses([]);
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
    <div>
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
      ) : (
        <>
          <Typography className='section-header'>{`Wallet Addresses(${addresses.length})`}</Typography>
          <List>
            {addresses.map((address, index) => (
              <ListItemText key={index}>{address}</ListItemText>
            ))}
          </List>
        </>
      )}
    </div>
  );
};

export default IdentityPage;
