import { Box, Container, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';


const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Dotflow UI</title>
      </Head>
      <Container maxWidth='xl'>
        <Box>
          <Typography variant='h1' textAlign='center'>
            Welcome to
          </Typography>

          <Typography variant='h4' textAlign='center'>
            DotFlow UI
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default Home;
