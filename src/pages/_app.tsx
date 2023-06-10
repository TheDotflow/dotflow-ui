import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import { UseInkProvider } from 'useink';
import { RococoContractsTestnet, ShibuyaTestnet } from 'useink/chains';
import '../../styles/global.scss';

import createEmotionCache from '@/utils/createEmotionCache';
import theme from '@/utils/muiTheme';

import { Layout } from '@/components/Layout';

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
        <UseInkProvider
          config={{
            dappName: 'Dotflow UI',
            chains: [RococoContractsTestnet, ShibuyaTestnet],
          }}
        >
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {getLayout(<Component {...pageProps} />)}
        </UseInkProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
