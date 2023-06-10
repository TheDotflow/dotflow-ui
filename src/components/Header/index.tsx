import Image from 'next/image';
import React from 'react';

import Logo from '@/assets/logo.png';

import styles from './index.module.scss';

export const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <Image src={Logo} alt='logo' className={styles.logoImg} />
      </div>
      <div className={styles.menu}></div>
    </div>
  );
};
