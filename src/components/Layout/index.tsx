import React, { ReactElement } from 'react';

import styles from './index.module.scss';
import { Header } from '../Header';

interface Props {
  children: ReactElement | ReactElement[];
}

export const Layout = ({ children }: Props) => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.content}>
        <div className={styles.sidebar}></div>
        <div className={styles.main}>{children}</div>
      </div>
    </div>
  );
};
