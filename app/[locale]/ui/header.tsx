'use client';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@nextui-org/react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageChanger from '../components/LanguageChanger';

function Header() {
  const { t } = useTranslation();
  return (
    <Navbar className="h-[10vh] px-10 z-50" position="sticky">
      <NavbarBrand className="text-4xl font-bold">Logo</NavbarBrand>
      <NavbarContent
        className="hidden sm:flex gap-24 font-semibold"
        justify="center"
      >
        <NavbarItem>
          <Link href="/">{t('header-home')}</Link>
        </NavbarItem>
        <NavbarItem>
          <a href="#about">{t('header-about')}</a>
        </NavbarItem>
        <NavbarItem>
          <a href="#case">{t('header-cases')}</a>
        </NavbarItem>
        <NavbarItem>
          <a href="#contact">{t('header-contact')}</a>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <LanguageChanger />
      </NavbarContent>
    </Navbar>
  );
}

export default Header;
