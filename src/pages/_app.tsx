import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { UseInkathonProvider } from '@scio-labs/use-inkathon';
import { ConfirmProvider } from 'material-ui-confirm';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import '../../styles/global.scss';

import createEmotionCache from '@/utils/createEmotionCache';
import theme from '@/utils/muiTheme';

import { Layout } from '@/components/Layout';

import { RelayApiContextProvider } from '@/contexts/RelayApi';
import { ToastProvider } from '@/contexts/Toast';
import { IdentityContractProvider } from '@/contracts';
import { AddressBookContractProvider } from '@/contracts/addressbook/context';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();
export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (_page: React.ReactElement) => React.ReactNode;
};
interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
  Component: NextPageWithLayout;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <title>Dotflow UI</title>
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <ToastProvider>
          <UseInkathonProvider
            appName='DotFlow UI'
            connectOnInit={false}
            defaultChain={
              {
                network: 'rocococ-contracts',
                name: 'Rococo contracts',
                ss58Prefix: 42,
                rpcUrls: ['wss://rococo-contracts-rpc.polkadot.io'],
                explorerUrls: {},
                testnet: true,
                faucetUrls: [],
              }
            }
          >
            <IdentityContractProvider>
              <AddressBookContractProvider>
                <ConfirmProvider>
                  {getLayout(<Component {...pageProps} />)}
                </ConfirmProvider>
              </AddressBookContractProvider>
            </IdentityContractProvider>
          </UseInkathonProvider>
        </ToastProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
