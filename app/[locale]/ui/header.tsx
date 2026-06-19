'use client';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageChanger from '../components/LanguageChanger';

function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: t('header-home'), href: '/' },
    { label: t('header-about'), href: '#about' },
    { label: t('header-cases'), href: '#case' },
    { label: t('header-contact'), href: '#contact' },
  ];

  return (
    <Navbar
      isMenuOpen={menuOpen}
      onMenuOpenChange={setMenuOpen}
      maxWidth="full"
      className="h-16 border-b border-line/70 bg-cream/80 px-4 backdrop-blur-md sm:px-8 lg:px-12 z-50"
      classNames={{ wrapper: 'px-0' }}
      position="sticky"
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link
            href="/"
            aria-label="Nhat Linh Nguyen, home"
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-display text-base font-bold text-cream">
              NL
            </span>
            <span className="hidden font-display text-lg font-semibold tracking-tight text-ink sm:inline">
              Nhat Linh <span className="text-ink-soft">Nguyen</span>
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden gap-10 text-sm font-medium sm:flex"
        justify="center"
      >
        {links.map((link) => (
          <NavbarItem key={link.href}>
            {link.href.startsWith('#') ? (
              <a
                href={link.href}
                className="text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            )}
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <LanguageChanger />
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="text-ink sm:hidden"
        />
      </NavbarContent>

      <NavbarMenu className="bg-cream/95 pt-6 backdrop-blur-md">
        {links.map((link) => (
          <NavbarMenuItem key={link.href}>
            {link.href.startsWith('#') ? (
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 font-display text-2xl font-semibold text-ink"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 font-display text-2xl font-semibold text-ink"
              >
                {link.label}
              </Link>
            )}
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}

export default Header;
