'use client';
import {
  NavbarItem,
  Dropdown,
  DropdownItem,
  DropdownTrigger,
  Button,
  DropdownMenu,
} from '@heroui/react';
import { RiGlobalLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import i18nConfig from '@/i18nConfig';

export default function LanguageChanger() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChange = (e) => {
    const newLocale = e;

    // set cookie for next-i18n-router
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    // redirect to the new locale path
    if (
      currentLocale === i18nConfig.defaultLocale &&
      !i18nConfig.prefixDefault
    ) {
      router.push('/' + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
  };

  return (
    <Dropdown>
      <NavbarItem>
        <DropdownTrigger>
          <Button
            isIconOnly
            variant="bordered"
            aria-label="Change language"
            className="border-line text-ink-soft transition-colors hover:border-accent hover:text-accent-deep"
          >
            <RiGlobalLine size={20} />
          </Button>
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu
        onAction={handleChange}
        className="text-center"
        itemClasses={{
          base: [
            'rounded-md',
            'text-default-500',
            'transition-opacity',
            'data-[hover=true]:text-white',
            'data-[hover=true]:bg-[#8e705b]',
            'dark:data-[hover=true]:bg-default-50',
            'data-[selectable=true]:focus:bg-default-50',
            'data-[pressed=true]:opacity-70',
            'data-[focus-visible=true]:ring-default-500',
          ],
        }}
      >
        <DropdownItem key={'en'} className="hover:text-white">
          <span className="font-bold">EN</span>
        </DropdownItem>
        <DropdownItem key={'fr'} className="hover:text-white">
          <span className="font-bold">FR</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
