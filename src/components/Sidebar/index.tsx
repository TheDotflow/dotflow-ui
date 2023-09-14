import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactsIcon from '@mui/icons-material/Contacts';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useRouter } from 'next/router';
import React from 'react';
import RelaySelect from '../RelaySelect';

import styles from './index.module.scss';
interface MenuItemProps {
  label: string;
  route: string;
  icon: any;
}
const MenuItem = ({ label, route, icon }: MenuItemProps) => {
  const { pathname, push } = useRouter();
  const isActive = pathname === route;
  return (
    <div
      className={`${styles.menuItem} ${isActive ? styles.active : styles.inactive
        }`}
      onClick={() => push(route)}
    >
      {{
        ...icon,
      }}
      <span>{label}</span>
    </div>
  );
};

export const Sidebar = ({ relay, setRelay }: { relay: string, setRelay: (relay: string) => void }) => {
  console.log(setRelay);
  const menuItems: MenuItemProps[] = [
    {
      label: 'My Identity',
      route: '/identity',
      icon: <AccountCircleIcon />,
    },
    {
      label: 'Address Book',
      route: '/address_book',
      icon: <ContactsIcon />,
    },
    {
      label: 'Transfer',
      route: '/transfer',
      icon: <SwapHorizIcon />,
    },
  ];
  return (
    <div className={styles.container}>
      {menuItems.map((item, index) => (
        <MenuItem key={index} {...item} />
      ))}
      <div className={styles.networkSelect}>
        <RelaySelect relay={relay} setRelay={setRelay} />
      </div>
    </div>
  );
};
