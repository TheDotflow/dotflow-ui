import { ExpandMore } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Collapse, Divider, List, ListItemButton } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import Image from 'next/image';
import React, { useState } from 'react';

import Logo from '@/assets/logo.png';

import styles from './index.module.scss';
import { WalletModal } from '../Modals';

export const Header = () => {
  const {
    activeAccount,
    disconnect,
    accounts,
    setActiveAccount,
    isConnecting,
  } = useInkathon();
  const [accountsOpen, openAccounts] = useState(false);
  const [walletModalOpen, openWalletModal] = useState(false);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.logo}>
          <Image src={Logo} alt='logo' className={styles.logoImg} />
        </div>
        <div className={styles.menu}>
          {activeAccount ? (
            <List component='div' className={styles.listWrapper}>
              {!accountsOpen && (
                <ListItemButton
                  onClick={() => openAccounts(true)}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {activeAccount.name}
                  <ExpandMore />
                </ListItemButton>
              )}

              <Collapse in={accountsOpen} className={styles.accountsWrapper}>
                <List component='div' className={styles.accountsList}>
                  {accounts?.map((account, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => {
                        setActiveAccount && setActiveAccount(account);
                        openAccounts(false);
                      }}
                    >
                      {account.name}
                    </ListItemButton>
                  ))}
                </List>
                <Divider />
                <ListItemButton onClick={disconnect}>Disconnect</ListItemButton>
              </Collapse>
            </List>
          ) : (
            <LoadingButton
              variant='outlined'
              className='btn-secondary'
              onClick={() => openWalletModal(true)}
              loading={isConnecting}
            >
              Connect Wallet
            </LoadingButton>
          )}
        </div>
      </div>
      <WalletModal
        open={walletModalOpen}
        onClose={() => openWalletModal(false)}
      />
    </>
  );
};
