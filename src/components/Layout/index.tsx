import { Typography } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import React, { ReactElement } from 'react';

import styles from './index.module.scss';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';

interface Props {
  children: ReactElement | ReactElement[];
}

export const Layout = ({ children }: Props) => {
  const { isConnected } = useInkathon();
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.content}>
        <div className={styles.sidebar}>
          <Sidebar />
        </div>
        <div className={styles.main}>
          {isConnected ? (
            children
          ) : (
            <Typography variant='h6' className={styles.warningText}>
              Please connect your wallet
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};
