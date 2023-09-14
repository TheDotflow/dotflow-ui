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

import { RelayApiContextProvider, RelayContextProvider, useRelay } from '@/contexts/RelayApi';
import { ToastProvider } from '@/contexts/Toast';
import { IdentityContractProvider } from '@/contracts';
import { AddressBookContractProvider } from '@/contracts/addressbook/context';
import { createContext, useState } from 'react';

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
  const { relay, setRelay } = useRelay();
  const getLayout = Component.getLayout ?? ((page) =>
    <RelayContextProvider>
      <Layout relay={relay} setRelay={setRelay}>{page}</Layout>
    </RelayContextProvider>
  );

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
          <RelayContextProvider>
            <RelayApiContextProvider relay={relay}>
              <UseInkathonProvider
                appName='DotFlow UI'
                connectOnInit={false}
                defaultChain={{
                  network: 'rocococ-contracts',
                  name: 'Rococo contracts',
                  ss58Prefix: 42,
                  rpcUrls: ['wss://rococo-contracts-rpc.polkadot.io'],
                  explorerUrls: {},
                  testnet: true,
                  faucetUrls: [],
                }}
              >
                <IdentityContractProvider relay={relay}>
                  <AddressBookContractProvider>
                    <ConfirmProvider>
                      {getLayout(<Component {...pageProps} relay={relay} />)}
                    </ConfirmProvider>
                  </AddressBookContractProvider>
                </IdentityContractProvider>
              </UseInkathonProvider>
            </RelayApiContextProvider>
          </RelayContextProvider>
        </ToastProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
