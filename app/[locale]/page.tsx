import Header from './ui/header';
import About from './components/about';
import CaseStudy from './components/case_study';
import Contact from './components/contact';
import Hero from './components/hero';
import initTranslations from '../i18n';
import TranslationProvider from '@/app/[locale]/components/TranslationProvider';

type Locale = 'en' | 'fr' | string;

interface HomeProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  const { t, resources } = await initTranslations(locale, ['common']);
  return (
    <TranslationProvider
      resources={resources}
      locale={locale}
      namespaces={['common']}
    >
      <Header />
      <main className="flex w-full flex-col font-sans">
        <Hero />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <hr className="border-line" />
        </div>
        <About />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <hr className="border-line" />
        </div>
        <CaseStudy />
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <hr className="border-line" />
        </div>
        <Contact />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:px-8">
          <span className="font-display font-semibold text-ink">
            Nhat Linh Nguyen
          </span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </TranslationProvider>
  );
}
